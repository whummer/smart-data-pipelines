/**
 * Main application routes
 */

'use strict';

module.exports = function(app) {

  /* API routes */
  app.use('/api/v1/users', require('./api/users'));
  app.use('/api/v1/organizations', require('./api/organizations'));
  app.use('/api/v1/notifications', require('./api/notifications'));
  app.use('/api/v1/certificates', require('./api/certificates'));

  /* Health check */
  app.use('/healthz', require("riox-services-base/lib/health/health-simple.js"));

};
