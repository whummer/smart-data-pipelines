
/*
HTTP API 
	- Operations 
			- HTTP method 
			- Resource
			- Request/Response data schema


WS API
	- no operations
	- Data schema (options)
	- Filters
*/

var logger = require("./logging"),
		fs = require('fs'),
		util = require('util'),
		colors = require('colors'),
		parseArgs = require('minimist'), 
		Gateway = require('./gateway');


// Process command line arguments
var args = parseArgs(process.argv.slice(2));
validateArgs(args)
setLogging(args);

// Read configuration file 
fs.readFile( (args.config || args.c), 'utf8', function (err,data) {
	if (err) {
		return logger.error("Error while reading the config file:", err);
	}
	var options = JSON.parse(data);
	var gateway = new Gateway(options, logger);
	gateway.start();
});

//
// Functions for processing the CLI arguments
//
function validateArgs(args) {
	// TODO: validate CLI args
	printHelp(args);

	logger.debug("TODO: validate args");
	if (!(args.c || args.config))
		error("No config file specified. Use -c <file> | --config <file>.");
} 

function setLogging(args) {
	if (args.v || args.verbose) 
		logger.level = 'debug';
}

function error(message) {
	console.log('Error: '.red + message);
	process.exit(1);
}

function printHelp() {
	if (!(args.h || args.help)) 
		return;

	console.log("Usage: rgw ARGUMENTS");
	console.log("  Required:");
	console.log("    -c | --config <FILE>  Location of JSON config file.");
	console.log("  Optional:");
	console.log("    -h | --help           Prints this help.");
	console.log("    -v | --verbose        Enable verbose logging.");
	
	process.exit(0);
}