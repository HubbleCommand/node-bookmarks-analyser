const fileUtils = require('./utils/FileUtils.js');
const scrapUtils = require('./utils/ScrapUtils.js');
const axios = require('axios');
const cliProgress = require('cli-progress');
var url = require('url');
const _colors = require('colors');

async function scrap(urlsPath, parametersPath, destinationPath){
    var urlsFile = fileUtils.getFile(urlsPath);
    var parameters = fileUtils.getFile(parametersPath);

    if(!scrapUtils.verifyParameters(parameters)){
        return undefined;
    }

    var data = [];
    var missedSites = [];

    const multibar = new cliProgress.MultiBar({
        format: ' |' + _colors.cyan('{bar}') + ' | "{name}" | {value}/{total}',
        hideCursor: true,
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        clearOnComplete: true,
        stopOnComplete: true
    });

    var retrieved = multibar.create(urlsFile.length, 0, {name : "Retrieved"});
    var missed = multibar.create(urlsFile.length, 0, {name : "Missed"});

    for (urlItem of urlsFile){
        //See if there are any parameters for this host. Check for longest matching host URL in the case of sub-urls
        //(i.e. we might want to scrap different parts of a site differently!)
        var hostParams = parameters[scrapUtils.findLongestMatchingHost(urlItem.href, Object.keys(parameters))]

        if(hostParams){ //If there are params, analyse with the host parameters
            var siteContent = await axios.get(urlItem.href);
            urlItem["data"] = scrapUtils.scrap(siteContent.data, hostParams);
            data.push(urlItem);
            retrieved.increment();
        } else {        //If there is NOT any params to search by, handle!
            missedSites.push(urlItem.href);
            retrieved.increment();
            missed.increment();
        }
    }

    multibar.stop();
    console.log("FINISHED SCRAPPING");
    console.log("The following URLs could not be scrapped");
    console.log(missedSites);
    
    fileUtils.writeObjectToFile(data, destinationPath, 4);
    fileUtils.writeObjectToFile(missedSites, destinationPath + ".missed", 4);
    console.log("RESULTS HAVE BEEN WRITTEN. HAVE A NICE DAY!")
}

exports.scrap = scrap