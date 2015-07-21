'use strict';

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
	}

};