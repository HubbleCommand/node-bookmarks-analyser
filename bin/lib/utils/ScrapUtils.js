const cheerio = require('cheerio')
const events = require('events');

//NEED A CLASS FOR PARAM THING
class ScrapParameter{
    constructor(){

    }

    verifyParameters(){

    }
}

class ScrapParameters{
    constructor(){

    }

    verifyParameters(){

    }
}

class ScrapUtils{

    verifyParameters(){

    }
}

class ScrapEmitter extends events.EventEmitter {
    constructor(){
        super();
    }
    emitMissed(){
        this.emit('scrapper-missed')
    }
    emitRetrieved(){
        this.emit('scrapper-retrieved')
    }
}

const PROPERTY = {
    ATTRIBUTE : "ATTRIBUTE",
    VALUE : "VALUE",
    PROP : "PROP",
    DATA : "DATA",
    TEXT : "TEXT",
    HTML : "HTML"
}

/**
 * Verifies the parameters
 * @param {Object} parameters the parameters to verify
 */
function verifyParameters(parameters){
    const entries = Object.entries(parameters)
    for (const [host, parameters] of entries) {
        var ids = [];
        for(parameter of parameters){
            //Check that is valid property
            if(!Object.values(PROPERTY).includes(parameter.property_type)) {
                console.log(property_type + " IS NOT A VALID PROPERTY TYPE!")
                return false;
            }

            //If not TEXT or HTML, we need a property ID
            if(parameter.property_type != "TEXT" && parameter.property_type != "HTML"){
                if(!parameter.property_id){
                    return false;
                }
            }

            //Check that ID isn't duplicate
            if(ids.includes(parameter.id)){
                console.log("ID : " + parameter.id + " already exists!")
                return false;
            } else {
                ids.push(parameter.id);
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
 * Finds the longest matching host for the given URL
 * @param {String} url              The url to compare
 * @param {Array.<String>} hosts    The list of host URLs to compare to
 * @returns {String}                The host URL found
 */
function findLongestMatchingHost(url, hosts){
    var longestMatching = "";
    for(host of hosts){
        if(url.includes(host)){
            if(host.length > longestMatching.length){
                longestMatching = host;
            }
        }
    }
    return longestMatching;
}

/**
 * Function that gets the html elements based on the provided parameters
 * @param {CheerioElement} html     The content to scrap
 * @param {Object} parameters       The array of params, see README
 * @returns {Array.<CheerioElement>}
 */
function scrap(html, parameters){
    var $ = cheerio.load(html)
    var dataArray = [];

    for(parameter of parameters){
        var selected = $(parameter.selector);
        var data;

        if(selected){
            switch(parameter.property_type){
                case PROPERTY.ATTRIBUTE:
                    data = selected.attr(parameter.property_id);
                    break;
    
                case PROPERTY.VALUE:
                    data = selected.val(parameter.property_id);
                    break;
    
                case PROPERTY.PROP:
                    data = selected.prop(parameter.property_id);
                    break;
    
                case PROPERTY.DATA:
                    data = selected.data(parameter.property_id);
                    break;
    
                case PROPERTY.TEXT:
                    data = selected.text();
                    break;
    
                case PROPERTY.HTML:
                    data = selected.html();
                    break;
    
                default:
                    throw "INVALID PARAMETER"
                    break;
            }
        } else {
            data = "SPAWS-rsvp-NODATA"
            /*A random string could be generated with
                Math.random().toString(36).substring(2, 15)
                But we want this to be easily findable
            */
            parameter['SPAWS-rsvp-missing'] = true;
        }
        
        parameter["data"] = data;
        dataArray.push(parameter);
    }
    return dataArray;
}

//Validation methods
exports.verifyParameters = verifyParameters;

//Methods for analysis
exports.filterWords = filterWords;
exports.scrap = scrap;
exports.findLongestMatchingHost = findLongestMatchingHost;
