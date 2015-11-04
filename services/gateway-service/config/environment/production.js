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

	redis: {
		url: appConfig["production"].infra.redis.url
	},

	kibana: {
		url: appConfig["production"].infra.kibana.url
	},

	nginx: {
		url: appConfig["production"].infra.nginx.url
	},

	elasticsearch: {
		hostname: appConfig["production"].infra.elasticsearch.hostname,
		port: 9300,
		url: "http://" + appConfig["production"].infra.elasticsearch.hostname + ":9200/"
	},

	services: appConfig["production"].services,
	
	seedDB: true

};