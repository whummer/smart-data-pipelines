/**
 * Main application routes
 */

'use strict';
var log = global.log || require('winston');
var util = require('riox-services-base/lib/util/errors');

module.exports = function (app, server) {

	/* API routes */
	app.use('/api/v1/proxies', require('./api/proxies'));
	app.use('/api/v1/gateway', require('./api/gateway'));
	app.use('/api/v1/statistics',
			require('./api/statistics')(app, server)
	);

	/* Health check */
	app.use('/healthz', require("riox-services-base/lib/health/health-simple.js"));

};
