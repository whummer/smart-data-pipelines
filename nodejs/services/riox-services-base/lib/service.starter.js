/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var cors = require('cors');
var util = require('./util/util');
var log = require('winston');
require('./api/service.calls');

var mongoose = global.mongoose || require('mongoose');
if(!global.mongoose) {
	global.mongoose = mongoose;
}
if(!global.servicesConfig) {
	global.servicesConfig = require('./config/services');
}


// configure winston logger
log.remove(log.transports.Console).add(log.transports.Console, {timestamp: true, debugStdout : true, colorize: true});

var start = function(config, routes, serviceName) {

	var app = {};

	app.start = function(config, routes, serviceName) {

		if(app.started) {
			return app;
		}

		// Setup server
		var expressApp = app.expressApp = express();
		expressApp.use(cors());

		if(config) app.__config = config;
		if(routes) app.__routes = routes;
		config = app.__config;
		routes = app.__routes;

		// configure port for microservices
		if(!config.port && process.env.SERVICE_PORT) {
			config.port = process.env.SERVICE_PORT;
		}

		// Connect to database
		if(process.env.TEST_MODE) {
			if(!mongoose.__mockgooseHasBeenApplied) {
				console.log("Using TEST mode (mockgoose)");
				var mockgoose = require('mockgoose');
				mockgoose(mongoose);
				mongoose.connect("");
				mongoose.__mockgooseHasBeenApplied = true;
			}
		} else {
//			if(!mongoose.__mongooseHasBeenConnected) {
				mongoose.connect(config.mongo.uri, config.mongo.options);
//				mongoose.__mongooseHasBeenConnected = true;
//			}
		}

		var server = app.server = require('http').createServer(expressApp);
		var expressConfig = require("./config/express");
		expressConfig(expressApp, config);
		routes(expressApp);

		server.listen(config.port, config.ip, function () {
			log.info('Service ' + serviceName + ' listening on %d, in %s mode', config.port, expressApp.get('env'));
		});
		app.started = true;
		return app;
	};

	app.stop = function(callback) {
		if(!app.started) return callback();
		app.started = false;
		//console.log("closing server", app.__config.port);
		app.server.close(callback);
	};

	app.start(config, routes, serviceName);

	return app;
}

// Expose app
exports.start = start;
