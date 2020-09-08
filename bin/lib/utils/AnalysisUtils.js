const cheerio = require('cheerio')

/**
 * Function that returns the list of words a text has, based on the ones we are searching for.
 * Useful for when we have large texts, to only get the words that are pertinent for us.
 * @param {String} textToFilter 
 * @param {Array.<String>} wordsToFilterWith 
 * @returns {Array.<String>}
 */
function filterWords(textToFilter, wordsToFilterWith){
    var foundWords = [];
    var words = textToFilter.split(" ");

    for (word of words){
        for(wordTarget of wordsToFilterWith){
            if (word.includes(wordTarget)){
                foundWords.push(wordTarget);
            }
        }
    }

    return foundWords;
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

/**
 * Function that gets the html elements based on the provided parameters
 * @param {CheerioElement} html     The 
 * @param {Object} parameters       The array of params, see README
 * @returns {Array.<CheerioElement>}
 */
function scrap(html, parameters){
    var $ = cheerio.load(html)
    var data = [];

    for(parameter of parameters){
        data.push({
            selector : parameter.selector,
            data : $(parameter.selector)
        });
    }
    return data;
}

//Methods for analysis
exports.filterWords = filterWords;
exports.analyse = analyse;
exports.scrap = scrap;