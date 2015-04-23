'use strict';

var appConfig = require("_/config/services.js");

// Test specific configuration
// ===========================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/riox-test'
  },

  facebook: {
    clientID:     appConfig.auth.facebook.client_id,
    callbackURL:  appConfig.auth.facebook.redirect_uri
  }

};