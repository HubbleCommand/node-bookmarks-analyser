var fs = require('fs');
const exiftool = require("exiftool-vendored").exiftool

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

function tagImage(image, tags){
    exiftool.write(image, tags).then(() => {return;}).catch(() => {throw "Error";})
}

exports.getFile = getFile;
exports.writeObjectToFile = writeObjectToFile;
exports.tagImage = tagImage;