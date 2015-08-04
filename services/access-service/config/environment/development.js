'use strict';

var appConfig = require("riox-services-base/lib/config/services.js");

// Development specific configuration
// ==================================
module.exports = {

	mongo: {
		uri: appConfig["development"].infra.mongodb.url
	},

	services: appConfig["development"].services

};
