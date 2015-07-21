'use strict';

var appConfig = require("riox-services-base/lib/config/services.js");

// Test specific configuration
// ===========================
module.exports = {

	mongo: {
		uri: appConfig["test"].infra.mongodb.url
	},

	services: appConfig["test"].services,

	seedDB: true

};
