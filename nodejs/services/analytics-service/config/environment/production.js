'use strict';

// Production specific configuration
// =================================
module.exports = {

	// MongoDB connection options
	mongo: {
		uri: appConfig["production"].infra.mongodb.url
	},

	services: appConfig["production"].services

};