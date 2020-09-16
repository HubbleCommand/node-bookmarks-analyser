//To export all of the utils into a single module
const fileUtils = require('./FileUtils.js');
const scrapUtils = require('./ScrapUtils.js');
const downloadUtils = require('./DownloadUtils.js');
const esUtils = require('./ESUtils.js');

module.exports = {
    FileUtils : fileUtils,
    ScrapUtils : scrapUtils,
    DownloadUtils : downloadUtils,
    ESUtils : esUtils
}