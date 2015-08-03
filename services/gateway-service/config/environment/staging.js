'use strict';

var appConfig = require("riox-services-base/lib/config/services.js");

// Production specific configuration
// =================================
module.exports = {

	mongo: {
		uri: appConfig["staging"].infra.mongodb.url
	},

	kafka: {
		hostname: appConfig["staging"].infra.kafka.hostname,
		port: 9092
	},

	zookeeper: {
		hostname: appConfig["staging"].infra.zookeeper.hostname,
		port: 2181
	},

	redis: {
		url: appConfig["staging"].infra.redis.url
	},

	services: appConfig["staging"].services,
	
	seedDB: true

};
