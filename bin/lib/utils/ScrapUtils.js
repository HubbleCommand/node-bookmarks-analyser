const cheerio = require('cheerio')

/**
 * Verifies the parameters
 * @param {Object} parameters the parameters to verify
 */
function verifyParameters(parameters){
    const entries = Object.entries(parameters)
    for (const [host, parameters] of entries) {
        console.log(`There are ${host} ${parameters}s`)
        console.log(parameters)

        var ids = [];
        for(item of parameters){
            if(ids.includes(item.id)){
                console.log("ID : " + item.id + " already exists!")
                return false;
            } else {
                ids.push(item.id);
            }
        }
    }
    return true;
}

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

/**
 * Function that gets the html elements based on the provided parameters
 * @param {CheerioElement} html     The content to scrap
 * @param {Object} parameters       The array of params, see README
 * @returns {Array.<CheerioElement>}
 */
function scrap(html, parameters){
    var $ = cheerio.load(html)
    var data = [];

    for(parameter of parameters){
        data.push({
            id : parameter.id,
            selector : parameter.selector,
            data : $(parameter.selector).text()
        });
    }
    return data;
}

//Validation methods
exports.verifyParameters = verifyParameters;

//Methods for analysis
exports.filterWords = filterWords;
exports.scrap = scrap;
exports.findLongestMatchingHost = findLongestMatchingHost;
