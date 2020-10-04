const fileUtils = require('./utils/FileUtils.js');
const scrapUtils = require('./utils/ScrapUtils.js');
const axios = require('axios');
const cliProgress = require('cli-progress');
var url = require('url');
const _colors = require('colors');
const events = require('events');
var ScrapEmitter = new scrapUtils.ScrapEmitter();

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
    var analys = multibar.create(urlsFile.length, 0, {name : "Analysed"});

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
    var scrappedResults = await scrapUtils.scrapAll({
        urls : urlsFile,
        parameters : parameters
    })
    

    //Do extra analysis with the scrapped data. Here, we convert the time to the same millisecond unit instead of various MM/DD/YYYY formats.
    for(result of scrappedResults.scrapped){
        if(isIterable(result.data)){
            for(data of result.data){
                analys.increment();
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

    multibar.stop();

    console.log("Scrap job finished at : " + new Date().toString())
}

exports.scrap = scrap
exports.scrapCLI = scrapCLI
