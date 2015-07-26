'use strict';

var appConfig = require("riox-services-base/lib/config/services.js");

module.exports = {

	mongo: {
		baseurl: appConfig["development"].infra.mongodb.baseurl
	},

	statsd: {
		hostname: appConfig["development"].infra.statsd.hostname
	},

	zookeeper: {
		host: appConfig["development"].infra.zookeeper.host
	},

	driver: appConfig["development"].infra.redis.url,

	services: appConfig["development"].services

};
