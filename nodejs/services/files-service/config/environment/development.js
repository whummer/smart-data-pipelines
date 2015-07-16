'use strict';

var appConfig = require("riox-services-base/lib/config/services.js");

module.exports = {

  mongo: {
    uri: 'mongodb://mongo.dev.riox.internal/riox-dev'
  },

  facebook: {
    clientID:     appConfig.auth.facebook.client_id,
    callbackURL:  appConfig.auth.facebook.redirect_uri
  },

  seedDB: true
};
