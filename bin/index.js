#!/usr/bin/env node
const { program } = require('commander');
const fileMerger = require('./lib/merge.js');
const scrapper = require('./lib/scrap.js');
const poster = require('./lib/post.js');
const utils = require('./lib/utils/Utils.js');

//Module exports for reuse.
module.exports = {
    Utils:utils,
    Scrapper:scrapper,
    Merger:fileMerger,
    Poster:poster
}
//console.log(module.exports)

//Commander CLI stuff
program.version('0.0.1');

/**
 * bookmarks-analyser m -t a -f D:\Files\Projects\node-bookmarks-analyser\example\bookmarks.json D:\Files\Projects\node-bookmarks-analyser\example\bookmarks.json
 * bookmarks-analyser m -t o -f dataA1.json dataA2.json dataA3.json dataA4.json dataA5.json dataA6.json dataA7.json dataA8.json dataA9.json dataA10.json dataA11.json dataA12.json dataA13.json dataA14.json dataA15.json dataA16.json dataA17.json dataA18.json dataA19.json
 */
program.command('merge')
    .alias('m')
    .description('Will merge all requested files')
    .requiredOption('-t, --type <type>', 'specify merge operation type: a for array or o for object')
    .requiredOption('-f, --files <files...>', 'specify files')
    .action(function(args){
        switch(args.type){
            case 'a':
                fileMerger.mergeFilesArrays(args.files)
                break;
            case 'o':
                fileMerger.mergeFilesObjects(args.files)
                break;
            default:
                console.log("Need to choose an operation type!")
        }
    });

/**
 * bookmarks-analyser s -f bookmarks-News-2020-09-23.json -p news_params.json -d analysed_all.json
 */
program.command('scrap')
    .alias('s')
    .description('Will scrap the given bookmarks file based on the given parameters')
    .requiredOption('-f, --file <file>', 'specify the file of URLs to scrap')
    .requiredOption('-p, --parameters <parameters>', 'specify file that holds analysis parameters')
    .requiredOption('-d, --destination <destination>', 'specify the output file path')
    .action(function(args){
        scrapper.scrapCLI(args.file, args.parameters, args.destination);
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