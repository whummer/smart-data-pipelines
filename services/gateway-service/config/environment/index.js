'use strict';

var path = require('path');
var merge = require('riox-services-base/lib/config/merge');
var commonConfig = require('riox-services-base/lib/config');

// All configurations will extend these options
// ============================================
var config = {

	// Root path of server
	root: path.normalize(__dirname + '/../../..'),

	logging: {
		level: 'debug',
		timestamp: true,
		debugStdout: true,
		colorize: true,
		requestLogging: {
			logAllRequests: true,
			logMeta: false,
			logErrorRequests: true
		}
	}

};

/* load env. config */
var envConfig = require("./" + process.env.RIOX_ENV + ".js");
/* merge configs */
module.exports = merge(merge(commonConfig, config), envConfig);
