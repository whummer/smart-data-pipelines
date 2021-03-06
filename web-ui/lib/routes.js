/**
 * Main application routes
 */

'use strict';

var express = require('express');

module.exports = function(app) {

	// All undefined asset or api routes should return a 404
	app.route('/:url(api|auth|components|app|bower_components|assets)/!*')
		.get(function(req, res) {
			res.sendfile(app.get('appPath') + '/app/views/errors/404.html');
	});

	/* Health check */
	app.use('/healthz', require("riox-services-base/lib/health/health-simple.js"));

};
