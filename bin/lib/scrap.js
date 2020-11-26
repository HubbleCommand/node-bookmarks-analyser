const fileUtils = require('./utils/FileUtils.js');
const scrapUtils = require('./utils/ScrapUtils.js');
const axios = require('axios');
const cliProgress = require('cli-progress');
var url = require('url');
const _colors = require('colors');
const exiftool = require("exiftool-vendored").exiftool

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
    var analys = multibar.create(urlsFile.length, 0, {name : "Analysed"});

    console.log("Scrap job started at : " + new Date().toString())

    if(!scrapUtils.verifyParameters(parameters)){
        console.log("Params bad")
        return undefined;
    }

    //Proceed with scrapping
    var dataScrapped = [];
    var missedSites = [];

    for (urlItem of urlsFile){
        //See if there are any parameters for this host. Check for longest matching host URL in the case of sub-urls
        //(i.e. we might want to scrap different parts of a site differently!)
        var hostParams = parameters[scrapUtils.findLongestMatchingHost(urlItem.href, Object.keys(parameters))]

        if(hostParams){ //If there are params, analyse with the host parameters
            try {
                var siteContent = await axios.get(urlItem.href);
                var scrappedData = scrapUtils.scrap(siteContent.data, hostParams);
                if(scrappedData.length == 0){
                    dataScrapped.push(urlItem);
                    passed.increment();
                    missed.increment();
                } else {
                    urlItem["data"] = scrappedData;
                    dataScrapped.push(urlItem);
                    passed.increment();

                    //TODO We got the site, so we can do the analysis here
                }
            } catch (err) {
                missedSites.push(urlItem.href);
                passed.increment();
                missed.increment();
            }
        } else {        //If there is NOT any params to search by, handle!
            missedSites.push(urlItem.href);
            passed.increment();
            missed.increment();
        }
    }
    
    //Do extra analysis with the scrapped data. Here, we convert the time to the same millisecond unit instead of various MM/DD/YYYY formats.
    for(result of dataScrapped){
        if(scrapUtils.isIterable(result.data)){
            for(data of result.data){
                //Do something different based on host:
                var host = findLongestMatchingHost(result.href, Object.keys(parameters));
                console.log(host)
                switch(host){
                    case "www.rt.com":
                        break;
                    case "www.bbc.com":
                        break;
                }

                
                switch(data.id){
                    case "rt3":
                        data.data = new Date(data.data).getTime()
                        //TODO, make it download images & add metadata with EXIF format:
                        
                        exiftool.read('C:/Users/sasha/Desktop/q.jpg').then((tags /*: Tags */) => {
                            console.log("YO")
                            console.log(
                                `Make: ${tags.Make}, Model: ${tags.Model}, Errors: ${tags.errors}`
                            )
                            console.log(tags)
                        }).catch((err) => console.error("Something terrible happened: ", err))

                        //Image tags (i.e. topics) can be stored in: LastKeywordXMP / XPKeywords / Subject, as semi-colon seperated entries (i.e. : bob; steve; muriel)
                        //In LastKeywordXMP / Subject cases tho, read as an array, so -> ["bob", "steve", "muriel"]

                        break;
                    case "bbc2":
                        data.data = parseInt(data.data)
                        break;
                }

                analys.increment();
            }
        }
    }

    //Can do whatever with scrapping & analysis results, including writing results to files
    fileUtils.writeObjectToFile(scrappedResults.scrapped, destinationPath, 4);
    fileUtils.writeObjectToFile(scrappedResults.missed, destinationPath + ".missed", 4);

    multibar.stop();

    console.log("Scrap job finished at : " + new Date().toString())

    return {
        missed:missedSites,
        scrapped:dataScrapped
    };
}

exports.scrapCLI = scrapCLI
