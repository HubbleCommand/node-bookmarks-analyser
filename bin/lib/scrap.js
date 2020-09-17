const fileUtils = require('./utils/FileUtils.js');
const scrapUtils = require('./utils/ScrapUtils.js');
const axios = require('axios');
var url = require('url');

async function scrap(urlsPath, parametersPath, destinationPath){
    var urlsFile = fileUtils.getFile(urlsPath);
    var parameters = fileUtils.getFile(parametersPath);

    if(!scrapUtils.verifyParameters(parameters)){
        return undefined;
    }

    var data = [];
    var missedSites = [];

    for (urlItem of urlsFile){
        //See if there are any parameters for this host. Check for longest matching host URL in the case of sub-urls
        //(i.e. we might want to scrap different parts of a site differently!)
        var hostParams = parameters[scrapUtils.findLongestMatchingHost(urlItem.href, Object.keys(parameters))]

        if(hostParams){ //If there are params, analyse with the host parameters
            var siteContent = await axios.get(urlItem.href);
            urlItem["data"] = scrapUtils.scrap(siteContent.data, hostParams);
            data.push(urlItem);
        } else {        //If there is NOT any params to search by, handle!
            console.log("URL " + urlItem.href + " HAS NO PARAMETERS")
            missedSites.push(urlItem.href);
        }
    }

    console.log("FINISHED SCRAPPING");
    console.log("The following URLs could not be scrapped");
    console.log(missedSites);
    
    fileUtils.writeObjectToFile(data, destinationPath, 4);
    fileUtils.writeObjectToFile(missedSites, destinationPath + ".missed", 4);
    console.log("RESULTS HAVE BEEN WRITTEN. HAVE A NICE DAY!")
}

exports.scrap = scrap