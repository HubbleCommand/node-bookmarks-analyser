var fs = require('fs');

function writeObjectToFile(object, filePath, delimiter){
    fs.writeFileSync(filePath, JSON.stringify(object, null, delimiter));
}

function getFile(filePath){
    try {
        return JSON.parse(fs.readFileSync(filePath, {encoding:'utf8', flag:'r'}));
    } catch (err) {
        return undefined;
    }
}

exports.getFile = getFile;
exports.writeObjectToFile = writeObjectToFile;