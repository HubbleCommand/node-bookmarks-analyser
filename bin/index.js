#!/usr/bin/env node
const { program } = require('commander');
const fileMerger = require('./lib/merge.js');
const analyser = require('./lib/analyse.js');

program.version('0.0.1');


//To install, need to do npm i -g

//Add file merger for different exported bookmarks
program.command('merge')
    .description('Will merge all requested files')
    .requiredOption('-f, --files <files...>', 'specify files')
    //.option('-d, -destination <destination>', 'specify the destination merged file path')
    .action(function(args){
        fileMerger.mergeFiles(args.files)
    });

program.command('analyze')
    .description('Will analyse th given bookmarks file based on the given parameters')
    .requiredOption('-f, --file <file>', 'specify the file of URLs to analyse')
    .requiredOption('-p, --parameters <parameters>', 'specify file that holds analysis parameters')
    .option('-d, -destination <destination>', 'specify the output file path')
    .action(function(args){
        analyser.analyse(args.file, args.parameters, args.destination);
    });

program.parse();