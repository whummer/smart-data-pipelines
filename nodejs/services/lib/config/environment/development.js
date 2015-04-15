'use strict';

var appConfig = require("_/../../web-ui/lib/app/config.js");

// Development specific configuration
// ==================================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/riox-dev'
  },

  facebook: {
    clientID:     appConfig.auth.facebook.client_id,
    callbackURL:  appConfig.auth.facebook.redirect_uri
  },

  seedDB: false
};
