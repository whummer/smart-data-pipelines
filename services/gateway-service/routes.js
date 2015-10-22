/**
 * Main application routes
 */

'use strict';
var log = global.log || require('winston');
var util = require('riox-services-base/lib/util/errors');

var x = function (app, server) {

	/* API routes */
	app.use('/api/v1/proxies', require('./api/proxies'));
	app.use('/api/v1/gateway', require('./api/gateway'));
	app.use('/api/v1/statistics',
			require('./api/statistics')(app, server)
	);

	/* Health check */
	app.use('/healthz', require("riox-services-base/lib/health/health-simple.js"));

};

x.preload = function (app, server) {
	require('./api/forward')(app, server);
};

module.exports = x;
