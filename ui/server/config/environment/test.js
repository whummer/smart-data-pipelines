'use strict';

var cf = require('../cf.utils.js');

// Test specific configuration
// ===========================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri: cf.CLOUDFOUNDRY_MONGODB_DB_URL ||
    		 'mongodb://localhost/riox-test'
  }
};
