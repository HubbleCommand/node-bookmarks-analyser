const { Client } = require('@elastic/elasticsearch')

class Credentials{
    constructor(url, username, password) {
        this.url = url;
        this.username = username;
        this.password = password;
    }
    toAuth(){
        return {username:username,password:password}
    }
}

var conn = undefined;

function updateESConnection(stuff){
    if (typeof stuff.url === 'undefined'){
        throw "URL undefined";
    }
    if(stuff.auth){
        if(typeof stuff.auth.username === 'undefined' || typeof stuff.auth.password === 'undefined'){
            throw "Credentials undefined"
        }
        conn = new Client({ 
            node: url, 
            auth:{
                username:auth.username,
                password:auth.password
            } 
        })
    } else {
        conn = new Client({ 
            node: url
        })
    }
}

/**
 * Formats an object into something that can be
 * posted to an ES instance
 * @param {Object} object 
 * @returns {Object} the formatted object
 */
function formatES(object){

}

/**
 * Verifies that the object is valid
 * @param {Object} object to check
 */
function checkIfValidES(object){

}

function createIndex(index, body){

}

function postObjectArray(array){

}

exports.checkIfValidES = checkIfValidES;
exports.formatES = formatES;
exports.conn = conn;
exports.Credentials = Credentials;