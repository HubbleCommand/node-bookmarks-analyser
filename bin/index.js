#!/usr/bin/env node
const { program } = require('commander');
const fileMerger = require('./lib/merge.js');
const scrapper = require('./lib/scrap.js');
const poster = require('./lib/post.js');
const utils = require('./lib/utils/Utils.js');

//Module exports to be used by other modules. This may not be needed
module.exports = {
    Utils:utils.exports,
    Scrapper:scrapper,
    Merger:fileMerger,
    Poster:poster
}

//Commander CLI stuff
program.version('0.0.1');

/**
 * bookmarks-analyser m -f D:\Files\Projects\node-bookmarks-analyser\example\bookmarks.json D:\Files\Projects\node-bookmarks-analyser\example\bookmarks.json
 */
program.command('merge')
    .alias('m')
    .description('Will merge all requested files')
    .requiredOption('-f, --files <files...>', 'specify files')
    .action(function(args){
        fileMerger.mergeFiles(args.files)
    });

/**
 * bookmarks-analyser s -f D:\Files\Projects\node-bookmarks-analyser\example\bookmarks.json -p D:\Files\Projects\node-bookmarks-analyser\personal\news_params.json -d D:\Files\Projects\node-bookmarks-analyser\personal\analysed.json
 */
program.command('scrap')
    .alias('s')
    .description('Will scrap the given bookmarks file based on the given parameters')
    .requiredOption('-f, --file <file>', 'specify the file of URLs to scrap')
    .requiredOption('-p, --parameters <parameters>', 'specify file that holds analysis parameters')
    .requiredOption('-d, --destination <destination>', 'specify the output file path')
    .action(function(args){
        scrapper.scrap(args.file, args.parameters, args.destination);
    });

/**
 * 
 */
program.command('post')
    .alias('p')
    .description('Will post the given analysis file to an ES instance')
    .requiredOption('-f, --file <file>', 'specify the analysis file to post')
    .requiredOption('-d, --destination <destination>', 'specify the URL to post to')
    .action(function(args){
        poster.postFile(args.file, args.parameters, args.destination);
    });

program.parse();