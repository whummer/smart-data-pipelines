'use strict';

var appConfig = require("riox-services-base/lib/config/services.js");

// Development specific configuration
// ==================================
module.exports = {

	mongo: {
		uri: appConfig["development"].infra.mongodb.url
	},

	kafka: {
		hostname: appConfig["development"].infra.kafka.hostname,
		port: 9092
	},

	zookeeper: {
		hostname: appConfig["development"].infra.zookeeper.hostname,
		port: 2181
	},

	springxdadmin: {
		hostname: "xd-admin.development.svc.cluster.local",
		port: 9393
	},

	elasticsearch: {
		hostname: "elasticsearch.development.svc.cluster.local",
		port: 9300
	},

	services: appConfig["development"].services,

	seedDB: true
};
