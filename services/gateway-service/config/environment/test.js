'use strict';

var appConfig = require("riox-services-base/lib/config/services.js");

// Test specific configuration
// ===========================
module.exports = {

	mongo: {
		uri: appConfig["test"].infra.mongodb.url
	},

	kafka: {
		hostname: appConfig["test"].infra.kafka.hostname,
		port: 9092
	},

	zookeeper: {
		hostname: appConfig["test"].infra.zookeeper.hostname,
		port: 2181
	},

	redis: {
		url: appConfig["test"].infra.redis.url
	},

	kibana: {
		url: appConfig["test"].infra.kibana.url
	},

	nginx: {
		url: appConfig["test"].infra.nginx.url
	},

	elasticsearch: {
		hostname: appConfig["test"].infra.elasticsearch.hostname,
		port: 9300,
		url: "http://" + appConfig["test"].infra.elasticsearch.hostname + ":9200/"
	},

	services: appConfig["test"].services,
	
	seedDB: true

};
