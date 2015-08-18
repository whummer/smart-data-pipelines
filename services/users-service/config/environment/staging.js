'use strict';

var appConfig = require("riox-services-base/lib/config/services.js");

// Production specific configuration
// =================================
module.exports = {

	//
	// Important: DO NOT CHANGE UNLESS YOU KNOW WHAT YOU ARE DOING
	//  --> STAGING ENV uses PRODUCTION commodity services on purpose
	//
	
	mongo: {
		uri: appConfig["production"].infra.mongodb.url
	},

	services: appConfig["staging"].services,

	facebook: {
		clientID:		appConfig.auth.facebook.client_id,
		callbackURL:	appConfig.auth.facebook.redirect_uri
	},

	logging: {
		requestLogging : {
		   logAllRequests : false
		}
	},

	seedDB: true

};
