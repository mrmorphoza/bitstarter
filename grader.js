#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

eferences:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var util = require('util');
var rest = require('restler');
var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://fathomless-coast-8981.herokuapp.com";
var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlBuffer = function(buf) {
    return cheerio.load(buf);
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlBuf = function(buf, checksfile) {
 fs.writeFileSync('tmpit', buf);    
$ = cheerioHtmlBuffer(buf);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var buildfn = function(checks) {
    var response2console = function(result, response) {
        if (result instanceof Error) {
                if ( response )
            console.error('Error: ' + util.format(response.message));
                else
                console.error('Error: ' + result.toString());
        } else {
            console.error("\nNow checking using %s\n", checks);
    var checkJson = checkHtmlBuf(result, checks);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
        }
    };
    return response2console;
};

var checkViaUrl = function(url,checks) {
            console.error("\nFetching %s----\n", url);
    var response2console = buildfn(checks);
    rest.get(url).on('complete', response2console);
};

if(require.main == module) {
    program
        .option('-c, --checks ', 'Path to checks.json', assertFileExists, CHECKSFILE_DEFAULT)
        .option('-f, --file ', 'Path to index.html', assertFileExists, HTMLFILE_DEFAULT)
        .option('-u, --url ', 'url to index.html', assertFileExists, HTMLFILE_DEFAULT)
        .parse(process.argv);
	if ( !program.url  )
{
    var checkJson = checkHtmlFile(program.file, program.checks);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
}
else
{
checkViaUrl(program.args[program.args.length-1],program.checks);
}
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
