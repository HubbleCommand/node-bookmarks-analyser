const fileUtils = require('./utils/FileUtils.js');
const scrapUtils = require('./utils/ScrapUtils.js');
const axios = require('axios');
const cliProgress = require('cli-progress');
var url = require('url');
const _colors = require('colors');
const events = require('events');
var ScrapEmitter = new scrapUtils.ScrapEmitter();
const exiftool = require("exiftool-vendored").exiftool

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
                //Do something different based on host:
                var host = findLongestMatchingHost(result.href, Object.keys(parameters));

                switch(host){

                }

                
                switch(data.id){
                    case "rt3":
                        data.data = new Date(data.data).getTime()
                        //TODO, make it download images & add metadata with EXIF format:
                        /**
                         * https://www.npmjs.com/package/exif or https://www.npmjs.com/package/exiftool-vendored (https://stackoverflow.com/questions/53515567/please-recommend-a-node-module-for-writing-iptc-data-to-images)
                         * https://www.exif.org/
                         * https://www.windowscentral.com/how-edit-picture-metadata-windows-10
                         */
                        //USE https://www.npmjs.com/package/exiftool-vendored, can read & write!
                        
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
}

exports.scrapCLI = scrapCLI
