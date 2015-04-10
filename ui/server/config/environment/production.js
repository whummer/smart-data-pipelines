'use strict';

var cf = require('../cf.utils.js');

// Production specific configuration
// =================================
module.exports = {
  // Server IP
  ip:       process.env.IP ||
            undefined,

  // Server port
  port:     process.env.PORT ||
            8080,

  // MongoDB connection options
  mongo: {
    uri:    cf.CLOUDFOUNDRY_MONGODB_DB_URL ||            
            'mongodb://localhost/riox'
  }
};