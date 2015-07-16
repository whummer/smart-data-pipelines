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
			logAllRequests: false,
			logMeta: false,
			logErrorRequests: true
		}
	},

	// Should we populate the DB with sample data?
	seedDB: false,

	// Server port
	port: process.env.PORT || 9000,

	// MongoDB connection options
	mongo: {
		options: {
			db: {
				safe: true
			}
		}
	},

	kafka: {
		hostname: "kafka.dev.riox.internal",
		port: 9092
	},

	zookeeper: {
		hostname: "zookeeper.dev.riox.internal",
		port: 2181
	},

	xdadmin: {
		hostname: "xd-admin.dev.riox.internal",
		port: 9393
	},

	xdcontainer: {
		inbound: {
			hostname: "xd-inbound.dev.riox.internal",
			port: 9000
		},
		outbound: {
			hostname: "xd-outbound.dev.riox.internal",
			port: 9001
		}


	}

};

/* load env. config */
var envConfig = require("./" + process.env.NODE_ENV + ".js");
/* merge configs */
module.exports = merge(merge(commonConfig, config), envConfig);
