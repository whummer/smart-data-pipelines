'use strict';

var appConfig = require("riox-services-base/lib/config/services.js");

// Test specific configuration
// ===========================
module.exports = {
	// MongoDB connection options
	mongo: {
		uri: 'mongodb://mongo.dev.riox.internal/riox-test'
	},

	facebook: {
		clientID:     appConfig.auth.facebook.client_id,
		callbackURL:  appConfig.auth.facebook.redirect_uri
	},

	seedDB: true

};
