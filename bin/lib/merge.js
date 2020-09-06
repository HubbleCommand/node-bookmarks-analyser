const fileUtils = require('./utils/fileUtils.js')

function mergeFiles(files){
    var data = [];
    
    for(filePath of files){
        var file = fileUtils.getFile(filePath);
        Array.prototype.push.apply(data,file); 
        counter ++;
    }
    
    fileUtils.writeObjectToFile(data, 'merged.json', 4)
}

exports.mergeFiles = mergeFiles;