const cheerio = require('cheerio')
const axios = require('axios');     //For some reason, there is no crash if this isn't here, but the code doesn't work.

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

/**
 * 
 * @param {*} obj 
 */
function isIterable(obj) {
    // checks for null and undefined
    if (obj == null) {
      return false;
    }
    return typeof obj[Symbol.iterator] === 'function';
}

//This is a relatively unecessary class
class ScrapItem {
    constructor(href, data = null, object){
        //this = object;  //This doesn't work https://www.w3schools.com/js/js_object_constructors.asp --> "Note that this is not a variable. It is a keyword. You cannot change the value of this."
        Object.assign(this, object);
        this.href = href;
        if(data){
            this.data = data;
        }
    }

    /**
     * Set the URLItem data after the fact
     * @param {*} data 
     */
    setData(data){
        this.data = data;
    }
}

class ScrapParameter {
    constructor(object){
        //Check that it has the necessary attributes
        Object.assign(this, object);
        if(!this.id){
            //throw ``;
            throw `no id`;
        }
        if(!this.description){
            throw `no description`;
        }
        if(!this.selector){
            throw `no selector`;
        }
        if(!this.property_type){
            throw `no property type`;
        }
    }
}

class ScrapParameters{
    constructor(){

    }
}

/** Main scrapping function
 * @deprecated better implementation in scrap.js.
 * @param {Object} options The things to scrap with
 * @param {Array.<String>} options.urls       the list of URLs to scrap
 * @param {Array.<ParamElement>} options.parameters the parameters with which to scrap the URLs
 * @returns 
 */
async function scrapAll(options){
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
                if(scrappedData.length == 0){
                    data.push(urlItem);
                } else {
                    urlItem["data"] = scrappedData;
                    data.push(urlItem);
                }
            } catch (err) {
                missedSites.push(urlItem.href);
            }
        } else {        //If there is NOT any params to search by, handle!
            missedSites.push(urlItem.href);
        }
    }
    
    return {
        missed:missedSites,
        scrapped:data
    }
}

//Methods for analysis
exports.filterWords = filterWords;
exports.scrap = scrap;
exports.scrapAll = scrapAll;
exports.findLongestMatchingHost = findLongestMatchingHost;
exports.verifyParameters = verifyParameters;
exports.isIterable = isIterable;
