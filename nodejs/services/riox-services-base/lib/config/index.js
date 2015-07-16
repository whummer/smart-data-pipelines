'use strict';

var path = require('path');
var _ = require('lodash');

/* set global admin user */
global.adminUser = {email: "riox", password: "riox", role: "admin"};

// All configurations will extend these options
// ============================================
var all = {
	env: process.env.NODE_ENV,

	// Secret for session
	secrets: {
		session: 'riox-secret' // TODO
	},

	auth : {
		disable : process.env.DISABLE_AUTH || false
	},

	// List of user roles
	userRoles:
		[
		 'guest', 	// non-registered user
		 'apiKey',	// (anonymous) user identified via API Key
		 'user',	// registered user
		 'admin',	// admin
		 'internal'	// internal calls
		],

	facebook: {
		clientID: process.env.FACEBOOK_ID || 'id',
		clientSecret: process.env.FACEBOOK_SECRET || 'bd3a056db300ed5fefdd068cd88d15d4',
		callbackURL: (process.env.DOMAIN || '') + '/auth/facebook/callback'
	},

	twitter: {
		clientID: process.env.TWITTER_ID || 'id',
		clientSecret: process.env.TWITTER_SECRET || 'secretTwitter',
		callbackURL: (process.env.DOMAIN || '') + '/auth/twitter/callback'
	},

	google: {
		clientID: process.env.GOOGLE_ID || 'id',
		clientSecret: process.env.GOOGLE_SECRET || 'secretGoogle',
		callbackURL: (process.env.DOMAIN || '') + '/auth/google/callback'
	}

};


module.exports = all;
