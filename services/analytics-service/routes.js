/**
 * Main application routes
 */

'use strict';

//var errors = require('riox-services-base/lib/errors');

module.exports = function(app) {

  /* API routes */
  app.use('/api/v1/analytics', require('./api/analytics'));

  /* Health check */
  app.use('/healthz', require("riox-services-base/lib/health/health-simple.js"));

};
