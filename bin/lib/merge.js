const fileUtils = require('./utils/FileUtils.js')
const util = require('util')

function mergeFilesArrays(files){
    var data = [];
    
    for(filePath of files){
        var file = fileUtils.getFile(filePath);
        Array.prototype.push.apply(data,file);    //Works to copy an array's contents to another array, so not always good!
        console.log(util.inspect(file, {showHidden: false, depth: null}))
    }
    
    fileUtils.writeObjectToFile(data, 'merged.json', 4)
}

function mergeFilesObjects(files){
    //var data = [];
    var data = {pages:[]};
    
    //DO NOT USE FOR THINK DATA!!! Concrete5 takes too long to load a file with all of the pages, just do each one individually!
    //Use thinkdata example however for testing
    for(filePath of files){
        var file = fileUtils.getFile(filePath);
        
        //Simple version, just copy data exactly
        //data.push(file);

        //More advanced example to copy relevant sub-structures
        data.pages.push(file.pages);

        //console.log(util.inspect(file, {showHidden: false, depth: null})) //Print entire page object
    }
    
    fileUtils.writeObjectToFile(data, 'merged.json', 4)
}

exports.mergeFilesArrays = mergeFilesArrays;
exports.mergeFilesObjects = mergeFilesObjects;