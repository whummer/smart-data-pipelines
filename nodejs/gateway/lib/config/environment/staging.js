'use strict';

var appConfig = require("riox-services-base/lib/config/services.js");

module.exports = {

	mongo: {
		baseurl: appConfig["production"].infra.mongodb.baseurl
	},

	statsd: {
		hostname: appConfig["production"].infra.statsd.hostname
	},

	zookeeper: {
		host: appConfig["production"].infra.zookeeper.host
	},

	driver: appConfig["production"].infra.redis.url,

	services: appConfig["staging"].services
};
