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
        var host = url.parse(urlItem.href, true).host;
        var hostParams = parameters[host]  //See if there are any parameters for this host

        if(hostParams){ //If there are params, analyse with the host parameters
            var siteContent = await axios.get(urlItem.href, hostParams);
            var urlItemData = scrapUtils.scrap(siteContent.data, hostParams);
            data.push({
                url:urlItem.href,
                data:urlItemData
            })
        } else {        //If there is NOT any params to search by, handle!
            console.log("HOST " + host + " HAS NO PARAMETERS")
            missedSites.push(host);
        }
    }
    
    fileUtils.writeObjectToFile(data, destinationPath, 4);
    fileUtils.writeObjectToFile(missedSites, destinationPath + ".missed", 4);
}

exports.scrap = scrap