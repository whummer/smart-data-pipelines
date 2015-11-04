'use strict';

var appConfig = require("riox-services-base/lib/config/services.js");

// Production specific configuration
// =================================
module.exports = {

	mongo: {
		uri: appConfig["staging"].infra.mongodb.url
	},

	redis: {
		url: appConfig["staging"].infra.redis.url
	},

	nginx: {
		url: appConfig["staging"].infra.nginx.url
	},

	elasticsearch: {
		hostname: appConfig["staging"].infra.elasticsearch.hostname,
		port: 9300,
		url: "http://" + appConfig["staging"].infra.elasticsearch.hostname + ":9200/"
	},

	services: appConfig["staging"].services,

	seedDB: true

};
