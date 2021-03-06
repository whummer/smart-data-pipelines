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
		hostname: appConfig["test"].infra.redis.hostname,
		port: 6379,
		url: appConfig["test"].infra.redis.url,
		master: appConfig["test"].infra.redis.master,
		sentinels: appConfig["test"].infra.redis.sentinels
	},

	elasticsearch: {
		hostname: appConfig["test"].infra.elasticsearch.hostname,
		port: 9300
	},

	services: appConfig["test"].services,

	seedDB: true

};
