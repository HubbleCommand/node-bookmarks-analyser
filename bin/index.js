#!/usr/bin/env node
const { program } = require('commander');
const fileMerger = require('./lib/merge.js');
const scrapper = require('./lib/scrap.js');
const poster = require('./lib/post.js');

program.version('0.0.1');

program.command('merge')
    .alias('m')
    .description('Will merge all requested files')
    .requiredOption('-f, --files <files...>', 'specify files')
    //.option('-d, -destination <destination>', 'specify the destination merged file path')
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
    .option('-d, --destination <destination>', 'specify the output file path')
    .action(function(args){
        scrapper.scrap(args.file, args.parameters, args.destination);
    });

program.command('post')
    .alias('p')
    .description('Will post the given analysis file to an ES instance')
    .requiredOption('-f, --file <file>', 'specify the analysis file to post')
    .requiredOption('-d, --destination <destination>', 'specify the URL to post to')
    .action(function(args){
        poster.postFile(args.file, args.parameters, args.destination);
    });

program.parse();