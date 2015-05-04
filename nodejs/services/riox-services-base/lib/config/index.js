'use strict';

var path = require('path');
var _ = require('lodash');

// All configurations will extend these options
// ============================================
var all = {
  env: process.env.NODE_ENV,

  // Secret for session 
  secrets: {
    session: 'riox-secret' // TODO 
  },

  // List of user roles
  userRoles: ['guest', 'user', 'admin'],

  facebook: {
    clientID:     process.env.FACEBOOK_ID || 'id',
    clientSecret: process.env.FACEBOOK_SECRET || 'bd3a056db300ed5fefdd068cd88d15d4',
    callbackURL:  (process.env.DOMAIN || '') + '/auth/facebook/callback'
  },

  twitter: {
    clientID:     process.env.TWITTER_ID || 'id',
    clientSecret: process.env.TWITTER_SECRET || 'secretTwitter',
    callbackURL:  (process.env.DOMAIN || '') + '/auth/twitter/callback'
  },

  google: {
    clientID:     process.env.GOOGLE_ID || 'id',
    clientSecret: process.env.GOOGLE_SECRET || 'secretGoogle',
    callbackURL:  (process.env.DOMAIN || '') + '/auth/google/callback'
  }

};


module.exports = all;
