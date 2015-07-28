/**
 * Main application routes
 */

'use strict';

//var errors = require('riox-services-base/lib/errors');

module.exports = function(app) {

  /* API routes */
  app.use('/api/v1/files', require('./api/files'));

	/* Health check */
	app.use('/healtz', require("riox-services-base/lib/health/health-simple.js"));

};
