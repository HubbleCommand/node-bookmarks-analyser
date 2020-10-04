const cheerio = require('cheerio')
const events = require('events');
const axios = require('axios');     //For some reason, there is no crash if this sin't here, but the code doesn't work.

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
    emitMissed(data){
        this.emit('scrapper-missed', data)
    }
    emitRetrieved(data){
        this.emit('scrapper-retrieved', data)
    }
}
var ScrapEmitterLoc = new ScrapEmitter();

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
    console.log("scrapped")
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

/** Main scrapping function
 * @emits Passed        Fired when a URL has been treated, whether or not it has been scrapped
 * @emits Retrieved     Fired when a URL is scrapped
 * @emits Missed        Fired when a URL cannot me scrapped (no parameters to scrap with or cannot connect)
 * @param {Object} options The things to scrap with
 * @param {Array.<String>} options.urls       the list of URLs to scrap
 * @param {Array.<scrapUtils.ParamElement>} options.parameters the parameters with which to scrap the URLs
 * @returns 
 */
async function scrapAll(options){
    console.log("Called me with:")
    //console.log(options)
    //Check if we have what we need to proceed
    if(typeof options.urls === 'undefined'){
        console.log("No URLs")
        return undefined;
    }
    if(typeof options.parameters === 'undefined'){
        console.log("No params")
        return undefined;
    }
    if(!verifyParameters(options.parameters)){
        console.log("Params bad")
        return undefined;
    }

    //Proceed with scrapping
    var data = [];
    var missedSites = [];

    for (urlItem of options.urls){
        //See if there are any parameters for this host. Check for longest matching host URL in the case of sub-urls
        //(i.e. we might want to scrap different parts of a site differently!)
        var hostParams = options.parameters[findLongestMatchingHost(urlItem.href, Object.keys(options.parameters))]

        if(hostParams){ //If there are params, analyse with the host parameters
            try {
                var siteContent = await axios.get(urlItem.href);
                var scrappedData = scrap(siteContent.data, hostParams);
                console.log(scrappedData)
                if(scrappedData.length == 0){
                    data.push(urlItem);
                    ScrapEmitterLoc.emitMissed({id:1,error:"no data scrapped",item:urlItem});
                } else {
                    urlItem["data"] = scrappedData;
                    data.push(urlItem);
                    ScrapEmitterLoc.emitRetrieved(urlItem);
                }
            } catch (err) {
                ScrapEmitterLoc.emitMissed({id:1,error:"could not connect",item:urlItem});
            }
        } else {        //If there is NOT any params to search by, handle!
            missedSites.push(urlItem.href);
            ScrapEmitterLoc.emitMissed({id:1,error:"no host params found",item:urlItem});
        }
    }
    
    return {
        missed:missedSites,
        scrapped:data
    }
}

//Validation methods
exports.verifyParameters = verifyParameters;

//Methods for analysis
exports.filterWords = filterWords;
exports.scrap = scrap;
/*module.*/exports.scrapAll = scrapAll;
exports.findLongestMatchingHost = findLongestMatchingHost;
exports.ScrapEmitter = ScrapEmitter;
