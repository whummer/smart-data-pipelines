'use strict';

var appConfig = require("riox-services-base/lib/config/services.js");

// Production specific configuration
// =================================
module.exports = {

	mongo: {
		uri: appConfig["staging"].infra.mongodb.url
	},

	redis: {
		hostname: appConfig["staging"].infra.redis.hostname,
		port: 6379,
		url: appConfig["staging"].infra.redis.url,
		master: appConfig["staging"].infra.redis.master,
		sentinels: appConfig["staging"].infra.redis.sentinels
	},

	services: appConfig["staging"].services,

	seedDB: true

};
