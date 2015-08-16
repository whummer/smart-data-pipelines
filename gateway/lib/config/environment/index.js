'use strict';

var path = require('path');
var _ = require('lodash');

function requiredProcessEnv(name) {
	if (!process.env[name]) {
		throw new Error('You must set the ' + name + ' environment variable');
	}
	return process.env[name];
}

// All configurations will extend these options
// ============================================
var all = {
	env: process.env.RIOX_ENV,

	// Root path of server
	root: path.normalize(__dirname + '/../../..'),

	logging: {
		level: 'info',
		timestamp: true,
		debugStdout: true,
		colorize: true,
		requestLogging : {
			logAllRequests : true,
			logMeta : false,
			logErrorRequests : true
		}
	},

	// Should we populate the DB with sample data?
	seedDB: false

};

module.exports = _.merge(
	all,
	require('./' + process.env.RIOX_ENV + '.js') || {});
