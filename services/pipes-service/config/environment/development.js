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
		hostname: appConfig["development"].infra.redis.hostname,
		port: 6379,
		url: appConfig["development"].infra.redis.url,
		master: appConfig["development"].infra.redis.master,
		sentinels: appConfig["development"].infra.redis.sentinels
	},

	elasticsearch: {
		hostname: appConfig["development"].infra.elasticsearch.hostname,
		port: 9300
	},

	services: appConfig["development"].services,

	seedDB: true
};
