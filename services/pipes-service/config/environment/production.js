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

//	cdfLocal: {
//		hostname: appConfig["production"].infra.springcdfLocal.hostname,
//		port: 9393,
//		url: "http://" + appConfig["production"].infra.springcdfLocal.hostname + ":" + 9393
//	},
//
//	cdf: {
//		hostname: appConfig["production"].infra.springcdf.hostname,
//		port: 9393,
//		url: "http://" + appConfig["production"].infra.springcdf.hostname + ":" + 9393
//	},

	redis: {
		hostname: appConfig["production"].infra.redis.hostname,
		port: 6379,
		url: appConfig["production"].infra.redis.url
	},

	elasticsearch: {
		hostname: appConfig["production"].infra.elasticsearch.hostname,
		port: 9300
	},

	services: appConfig["production"].services,

	seedDB: true

};
