'use strict';

var appConfig = require("riox-services-base/lib/config/services.js");

/* set global admin user */
global.adminUser = {email: "riox", password: "riox", role: "admin"};

// Development specific configuration
// ==================================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://mongo.dev.riox.internal/riox-dev'
  },

  facebook: {
    clientID:     appConfig.auth.facebook.client_id,
    callbackURL:  appConfig.auth.facebook.redirect_uri
  },

  seedDB: true 


};
