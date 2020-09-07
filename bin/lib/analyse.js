const fileUtils = require('./utils/FileUtils.js');
const analysisUtils = require('./utils/AnalysisUtils.js');
const axios = require('axios');
var url = require('url');

async function analyse(urlsPath, parametersPath, destinationPath){
    var urlsFile = fileUtils.getFile(urlsPath);
    var parameters = fileUtils.getFile(parametersPath);
    //console.log(parameters)

    var data = [];

    for (urlItem of urlsFile){
        var hostParams = parameters[url.parse(urlItem.href, true).host]  //See if there are any parameters for this host

        if(hostParams){ //If there are params, analyse with the host parameters
            var siteContent = await axios.get(urlItem.href, hostParams);
            var urlItemData = analysisUtils.analyse(siteContent.data, hostParams);
            data.push({
                url:urlItem.href,
                data:urlItemData
            })
        } else {        //If there is NOT any params to search by, handle!
            console.log("HOST HAS NO PARAMETERS")
        }
    }
    
    fileUtils.writeObjectToFile(data, destinationPath, 4);
}

exports.analyse = analyse