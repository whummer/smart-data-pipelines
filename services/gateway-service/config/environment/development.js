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

	redis: {
		url: appConfig["development"].infra.redis.url
	},

	kibana: {
		url: appConfig["development"].infra.kibana.url
	},

	nginx: {
		url: appConfig["development"].infra.nginx.url
	},

	elasticsearch: {
		hostname: appConfig["development"].infra.elasticsearch.hostname,
		port: 9300,
		url: "http://" + appConfig["development"].infra.elasticsearch.hostname + ":9200/"
	},

	services: appConfig["development"].services,
	
	seedDB: true

};
