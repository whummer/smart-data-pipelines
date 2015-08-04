/**
 * Main application routes
 */

'use strict';
var log = global.log || require('winston');
var util = require('riox-services-base/lib/util/errors');

module.exports = function (app, server) {

	/* API routes */
	app.use('/api/v1/access', require('./api/access'));
	app.use('/api/v1/consents', require('./api/consents'));

	/* Health check */
	app.use('/healthz', require("riox-services-base/lib/health/health-simple.js"));

};
