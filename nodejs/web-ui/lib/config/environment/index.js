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
	env: process.env.NODE_ENV,

	// Root path of server
	root: path.normalize(__dirname + '/../..'),

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

	allowedPaths:
		[
		 	"/", "/index.html", "/favicon.ico"
		],
	allowedPathStarts:
		[
		 	"/bower_components", "/app", "/loaderio-"
		],

	// Server port
	port: process.env.PORT || 9000,

	// List of user roles
	userRoles: ['guest', 'user', 'admin']

};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
	all,
	require('./' + process.env.NODE_ENV + '.js') || {});
