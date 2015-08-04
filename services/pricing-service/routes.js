/**
 * Main application routes
 */

'use strict';
var log = global.log || require('winston');
var util = require('riox-services-base/lib/util/errors');

module.exports = function (app, server) {

	/* API routes */
	app.use('/api/v1/pricing', require('./api/pricing'));
	app.use('/api/v1/ratings', require('./api/ratings'));

	/* Health check */
	app.use('/healthz', require("riox-services-base/lib/health/health-simple.js"));

};
