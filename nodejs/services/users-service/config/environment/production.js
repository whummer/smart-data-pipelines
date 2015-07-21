'use strict';

// Production specific configuration
// =================================
module.exports = {

	mongo: {
		uri: appConfig["production"].infra.mongodb.url
	},

	services: appConfig["production"].services,

	facebook: {
		clientID:		appConfig.auth.facebook.client_id,
		callbackURL:	appConfig.auth.facebook.redirect_uri
	}

};