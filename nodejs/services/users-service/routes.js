/**
 * Main application routes
 */

'use strict';

module.exports = function(app) {

  /* API routes */
  app.use('/api/v1/users', require('./api/users'));
  app.use('/api/v1/organizations', require('./api/organizations'));
  app.use('/api/v1/notifications', require('./api/notifications'));

};
