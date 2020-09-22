const fileUtils = require('./utils/FileUtils.js');
const scrapUtils = require('./utils/ScrapUtils.js');
const axios = require('axios');
const cliProgress = require('cli-progress');
var url = require('url');
const _colors = require('colors');
const events = require('events');
var eventEmitter = new events.EventEmitter();
var ScrapEmitter = new scrapUtils.ScrapEmitter();

/** Main scrapping function
 * @emits Passed        Fired when a URL has been treated, whether or not it has been scrapped
 * @emits Retrieved     Fired when a URL is scrapped
 * @emits Missed        Fired when a URL cannot me scrapped (no parameters to scrap with or cannot connect)
 * @param {Object} options The things to scrap with
 * @param {Array.<String>} options.urls       the list of URLs to scrap
 * @param {Array.<scrapUtils.ParamElement>} options.parameters the parameters with which to scrap the URLs
 * @returns 
 */
async function scrap(options){
    //Check if we have what we need to proceed
    if(typeof options.urls === 'undefined'){
        return undefined;
    }
    if(typeof options.parameters === 'undefined'){
        return undefined;
    }
    if(!scrapUtils.verifyParameters(options.parameters)){
        return undefined;
    }

    //Proceed with scrapping
    var data = [];
    var missedSites = [];

    for (urlItem of options.urls){
        //See if there are any parameters for this host. Check for longest matching host URL in the case of sub-urls
        //(i.e. we might want to scrap different parts of a site differently!)
        var hostParams = options.parameters[scrapUtils.findLongestMatchingHost(urlItem.href, Object.keys(options.parameters))]

        if(hostParams){ //If there are params, analyse with the host parameters
            try {
                var siteContent = await axios.get(urlItem.href);
                var scrappedData = scrapUtils.scrap(siteContent.data, hostParams);
                if(scrappedData.length == 0){
                    data.push(urlItem);
                    ScrapEmitter.emitMissed({id:1,error:"no data scrapped",item:urlItem});
                } else {
                    urlItem["data"] = scrapUtils.scrap(siteContent.data, hostParams);
                    data.push(urlItem);
                    ScrapEmitter.emitRetrieved(urlItem);
                }
            } catch (err) {
                ScrapEmitter.emitMissed({id:1,error:"could not connect",item:urlItem});
            }
        } else {        //If there is NOT any params to search by, handle!
            missedSites.push(urlItem.href);
            ScrapEmitter.emitMissed({id:1,error:"no host params found",item:urlItem});
        }
    }
    
    return {
        missed:missedSites,
        scrapped:data
    }
}

function isIterable(obj) {
    // checks for null and undefined
    if (obj == null) {
      return false;
    }
    return typeof obj[Symbol.iterator] === 'function';
}

/**
 * An example of how to use the scrap function
 * @param {String} urlsPath 
 * @param {String} parametersPath
 * @param {String} destinationPath 
 */
async function scrapCLI(urlsPath, parametersPath, destinationPath){
    var urlsFile = fileUtils.getFile(urlsPath);
    var parameters = fileUtils.getFile(parametersPath);

    //Setup some CLI progress visuals
    const multibar = new cliProgress.MultiBar({
        format: ' |' + _colors.cyan('{bar}') + '| {percentage}% - {value}/{total} | {name} | ',
        hideCursor: true,
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        clearOnComplete: true,
        stopOnComplete: true
    });

    var passed = multibar.create(urlsFile.length, 0, {name : "Passed"});
    var missed = multibar.create(urlsFile.length, 0, {name : "Missed"});

    //Add listeners for scrap events
    ScrapEmitter.on('scrapper-retrieved', (data) => {
        passed.increment();
    });
    ScrapEmitter.on('scrapper-missed', (data) => {
        missed.increment();
        passed.increment();
    });

    console.log("Scrap job started at : " + new Date().toString())

    //Scrap
    var scrappedResults = await scrap({
        urls : urlsFile,
        parameters : parameters
    })
    multibar.stop();

    //Do extra analysis with the scrapped data
    for(result of scrappedResults.scrapped){
        if(isIterable(result.data)){
            for(data of result.data){
                switch(data.id){
                    case "rt3":
                        data.data = new Date(data.data).getTime()
                        break;
                    case "bbc2":
                        data.data = parseInt(data.data)
                        break;
                }
            }
        }
    }

    //Can do whatever with scrapping & analysis results, including writing results to files
    fileUtils.writeObjectToFile(scrappedResults.scrapped, destinationPath, 4);
    fileUtils.writeObjectToFile(scrappedResults.missed, destinationPath + ".missed", 4);

    console.log("Scrap job finished at : " + new Date().toString())
}

exports.scrap = scrap
exports.scrapCLI = scrapCLI
