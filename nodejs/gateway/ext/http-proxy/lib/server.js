
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

// require("appdynamics").profile({
//   controllerHostName: 'paid134.saas.appdynamics.com',
//   controllerPort: 443, // If SSL, be sure to enable the next line
//   accountName: 'Riox', // Required for a controller running in multi-tenant mode
//   accountAccessKey: 'uxs1zj3myb4h', // Required for a controller running in multi-tenant mode
//   applicationName: 'riox platform',
//   tierName: 'gateway',
//   nodeName: 'Node 80bf-', // Node names must be unique. A unique name has been generated for you.
//   controllerSslEnabled: true // Optional - use if connecting to controller via SSL
// });


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
	if (args.v || args.verbose) {
		logger.level = 'debug';
	}
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
