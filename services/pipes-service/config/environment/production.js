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
		hostname: "xd-admin.production.svc.cluster.local",
		port: 9393
	},

	elasticsearch: {
		hostname: "elasticsearch.production.svc.cluster.local",
		port: 9300
	},

	services: appConfig["production"].services,

	seedDB: true

};
