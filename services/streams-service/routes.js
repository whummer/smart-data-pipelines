/**
 * Main application routes
 */

'use strict';
var log = global.log || require('winston');
var util = require('riox-services-base/lib/util/errors');

module.exports = function (app, server) {

	/* API routes */
	app.use('/api/v1/streams', require('./api/streams'));
	app.use('/api/v1/access', require('./api/access'));
	app.use('/api/v1/consents', require('./api/consents'));
	app.use('/api/v1/ratings', require('./api/ratings'));
	app.use('/api/v1/pricing', require('./api/pricing'));
	app.use('/api/v1/gateway', require('./api/gateway'));
	app.use('/api/v1/statistics',
			require('./api/statistics')(app, server)
	);

	/* Health check */
	app.use('/healthz', require("riox-services-base/lib/health/health-simple.js"));

};
