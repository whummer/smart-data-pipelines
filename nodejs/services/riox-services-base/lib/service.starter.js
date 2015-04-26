/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var mongoose = require('mongoose');
var cors = require('cors');
var util = require('./util/util');
require('riox-services-base/lib/api/service.calls')

if(!global.servicesConfig) {
	global.servicesConfig = require('./config/services');
}

// Setup server
var app = express();
app.use(cors());

// Start server
app.start = function(config, routes) {
	console.log("app.started", app.started);
	if(app.started) return app;

	if(config) app.__config = config;
	if(routes) app.__routes = routes;
	config = app.__config;
	routes = app.__routes;

	// configure port for microservices
	config.port = process.env.SERVICE_PORT;

	// Connect to database
	if(process.env.TEST_MODE) {
		var mockgoose = require('mockgoose');
		mockgoose(mongoose);
		mongoose.connect("");
	} else {
		mongoose.connect(config.mongo.uri, config.mongo.options);
	}

	var server = app.server = require('http').createServer(app);
	var expressConfig = require("./config/express");
	expressConfig(app, config);
	routes(app);

	server.listen(config.port, config.ip, function () {
		console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
	});
	app.started = true;
	return app;
}
app.stop = function() {
	if(!app.started) return;
	app.started = false;
	app.server.close();
}

// Expose app
module.exports = app;
