/**
 * Main application routes
 */

'use strict';

var errors = require('_/errors');

module.exports = function(app) {

  /* API routes */
  app.use('/api/v1/streams', require('./api/streams'));
  app.use('/api/v1/access', require('./api/access'));

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendfile(app.get('appPath') + '/index.html');
    });
};
