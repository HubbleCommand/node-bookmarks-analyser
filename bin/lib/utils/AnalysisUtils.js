const cheerio = require('cheerio')

const ParameterActions = {
    COPY : "COPY",  //Copy the selected block
    TAGS : "TAGS"   //Filter by
}

const ParameterOptions = {
    COPYALL : "COPYALL"
}

function filterWords(textToFilter, wordsToFilterWith){

}

function analyse(html, parameters){
    var $ = cheerio.load(html)

    var data = [];

    for(parameter of parameters){
        console.log(parameter)
        if(parameter.action == "COPY"){
            var retreived = $(parameter.selector).text();

            console.log("Retreived with " + parameter.selector)
            console.log(retreived)
            data.push(retreived);
        }
    }
    return data;
}

//Enums for config
exports.ParameterActions = ParameterActions;
exports.ParameterOptions = ParameterOptions;

//Methods for analysis
exports.filterWords = filterWords;
exports.analyse = analyse;