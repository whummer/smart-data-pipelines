'use strict';

var appConfig = require("riox-services-base/lib/config/services.js");

// Production specific configuration
// =================================
module.exports = {

	mongo: {
		uri: appConfig["production"].infra.mongodb.url
	},

	kafka: {
		hostname: appConfig["production"].infra.kafka.hostname,
		port: 9092
	},

	zookeeper: {
		hostname: appConfig["production"].infra.zookeeper.hostname,
		port: 2181
	},

	springxdadmin: {
		hostname: appConfig["production"].infra.springxd.hostname,
		port: 9393
	},

	elasticsearch: {
		hostname: appConfig["production"].infra.elasticsearch.hostname,
		port: 9300
	},

	services: appConfig["production"].services,

	seedDB: true

};
