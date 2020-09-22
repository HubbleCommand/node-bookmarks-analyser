const fileUtils = require('./utils/FileUtils.js');
const esUtils = require('./utils/ESUtils.js');
const { Client } = require('@elastic/elasticsearch');

/**
 * Posts the given object to an ES instance
 * @param {Object} object       the object to send
 * @param {URL} url             the URL of the Elasticsearch instance
 * @param {String} username     the user of the ES instance
 * @param {String} password     the password for the user
 */
function postObject(object, url, username, password){
    esUtils.conn;
}

/**
 * Posts the given file to an ES instance
 * @param {String} file         the file to send
 * @param {URL} url             the URL of the Elasticsearch instance
 * @param {String} username     the user of the ES instance
 * @param {String} password     the password for the user
 */
function postFile(file, url, username, password){
    //Read file
    var data = fileUtils.getFile(file);

    
    const client = new Client({ 
        node: url, 
        auth:{
            username:username,
            password:password
        } 
    });
    client.bulk(data);
}

exports.postObject = postObject;
exports.postFile = postFile;