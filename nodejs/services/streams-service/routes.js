/**
 * Main application routes
 */

'use strict';

module.exports = function(app) {

  /* API routes */
  app.use('/api/v1/streams', require('./api/streams'));
  app.use('/api/v1/access', require('./api/access'));

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendfile(app.get('appPath') + '/index.html');
    });
};
