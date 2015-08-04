'use strict';

var appConfig = require("riox-services-base/lib/config/services.js");

module.exports = {

	mongo: {
		baseurl: appConfig["test"].infra.mongodb.baseurl
	},

	statsd: {
		hostname: appConfig["test"].infra.statsd.hostname
	},

	zookeeper: {
		host: appConfig["test"].infra.zookeeper.host
	},

	driver: appConfig["test"].infra.redis.url,

	services: appConfig["test"].services

};
