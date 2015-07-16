'use strict';

var path = require('path');
var merge = require('riox-services-base/lib/config/merge');
var commonConfig = require('riox-services-base/lib/config');
var appConfig = require('riox-services-base/lib/config/services');

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
		hostname: appConfig.infra.kafka.hostname,
		port: 9092
	},

	zookeeper: {
		hostname: appConfig.infra.zookeeper.hostname,
		port: 2181
	}

	// TODO remove
//	xdadmin: {
//		hostname: "TODO",
//		port: 9393
//	},
//
//	xdcontainer: {
//		inbound: {
//			hostname: "TODO",
//			port: 9000
//		},
//		outbound: {
//			hostname: "TODO",
//			port: 9001
//		}
//
//
//	}

};

/* load env. config */
var envConfig = require("./" + process.env.NODE_ENV + ".js");
/* merge configs */
module.exports = merge(merge(commonConfig, config), envConfig);
