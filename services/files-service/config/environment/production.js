'use strict';

var appConfig = require("riox-services-base/lib/config/services.js");

// Production specific configuration
// =================================
module.exports = {

	// MongoDB connection options
	mongo: {
		uri: appConfig["production"].infra.mongodb.url
	},

	services: appConfig["production"].services

};
