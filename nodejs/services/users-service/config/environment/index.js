'use strict';

var path = require('path');
var merge = require('riox-services-base/lib/config/merge');
var commonConfig = require('riox-services-base/lib/config');

function requiredProcessEnv(name) {
	if (!process.env[name]) {
		throw new Error('You must set the ' + name + ' environment variable');
	}

	return process.env[name];
}

var config = {
	env: process.env.RIOX_ENV,

	logging: {
		level: 'debug',
		timestamp: true,
		debugStdout: true,
		colorize: true,
		requestLogging : {
			logAllRequests : true,
			logMeta : false,
			logErrorRequests : true
		}
	},

	// Root path of server
	root: path.normalize(__dirname + '/../../..'),

	// Should we populate the DB with sample data?
	seedDB: false

};

/* load env. config */
var envConfig = require("./" + process.env.RIOX_ENV + ".js");

/* merge configs */
module.exports = merge(merge(commonConfig, config), envConfig);
