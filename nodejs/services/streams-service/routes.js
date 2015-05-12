/**
 * Main application routes
 */

'use strict';
var log = global.log || require('winston');
var util = require('riox-services-base/lib/util/errors');

module.exports = function (app) {
	//app.route('/error').get(function (req, res, next) {
	//	return next(util.InternalError("This is an error", "Cause oida"));
	//});

	/* API routes */
	app.use('/api/v1/streams', require('./api/streams'));
	app.use('/api/v1/access', require('./api/access'));
	app.use('/api/v1/consent', require('./api/consent'));

	// All other routes should redirect to the index.html
	app.route('/*')
		.get(function (req, res) {
			res.sendfile(app.get('appPath') + '/index.html');
		});
};


