'use strict';

var cf = require('../cf.utils.js');
var appConfig = require("../../../client/config.js");

// Development specific configuration
// ==================================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri: cf.CLOUDFOUNDRY_MONGODB_DB_URL ||
         'mongodb://localhost/riox-dev'
  },

  facebook: {
    clientID:     appConfig.auth.facebook.client_id,
    callbackURL:  appConfig.auth.facebook.redirect_uri
  },

  seedDB: true
};
