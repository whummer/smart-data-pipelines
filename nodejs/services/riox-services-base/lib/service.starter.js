/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var cors = require('cors');
var util = require('./util/util');
var expressWinston = require('express-winston');
var log = global.log = require('winston');
var errorHandler = require('./util/errors/handler')

require('./api/service.calls');

var mongoose = global.mongoose || require('mongoose');
if (!global.mongoose) {
	global.mongoose = mongoose;
}
if (!global.servicesConfig) {
	global.servicesConfig = require('./config/services');
}


var start = function (config, routes, serviceName) {

	var app = {};

	function configureRequestLogger(config, requestLogging, expressApp) {
		log.remove(log.transports.Console).add(log.transports.Console, config.logging);

		if (config.logging.requestLogging) {
			requestLogging = true;

			// this one has to go BEFORE the routes are loaded
			if (config.logging.requestLogging.logAllRequests) {
				expressApp.use(expressWinston.logger({
					transports: [
						new log.transports.Console({
							json: false,
							timestamp: true,
							colorize: true
						})
					],

					expressFormat: true,
					meta: config.logging.requestLogging.logMeta
				}))
			}
		}
		return requestLogging;
	}

	function configureErrorRequestLogging(expressApp) {
		console.log("Enabling error request logging");
		expressApp.use(expressWinston.errorLogger({
			transports: [
				new log.transports.Console({
					json: true,
					timestamp: true,
					colorize: true
				})
			]
		}));
	}

	app.start = function (config, routes, serviceName) {

		if (app.started) {
			return app;
		}

		// Setup server
		var expressApp = app.expressApp = express();
		expressApp.use(cors());

		if (config) app.__config = config;
		if (routes) app.__routes = routes;
		config = app.__config;
		routes = app.__routes;

		// configure port for microservices
		if (!config.port && process.env.SERVICE_PORT) {
			config.port = process.env.SERVICE_PORT;
		}

		// Connect to database
		if (process.env.TEST_MODE) {
			if (!mongoose.__mockgooseHasBeenApplied) {
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

		//
		// configure winston logger @todo think about if we should put this in express.js
		//
		var requestLogging = false;
		if (log && config.logging) {
			requestLogging = configureRequestLogger(config, requestLogging, expressApp);
		}

		var server = app.server = require('http').createServer(expressApp);
		var expressConfig = require("./config/express");
		expressConfig(expressApp, config);
		routes(expressApp);

		// need to put this AFTER the routes are loaded
		if (requestLogging && config.logging.requestLogging.logErrorRequests) {
			configureErrorRequestLogging(expressApp);
		}

		// install our custom error handler last
		expressApp.use(errorHandler);

		server.listen(config.port, config.ip, function () {
			log.info('Service ' + serviceName + ' listening on %d, in %s mode', config.port, expressApp.get('env'));
		});

		app.started = true;
		return app;
	};

	app.stop = function (callback) {
		if (!app.started) return callback();
		app.started = false;
		log.info("Shutting down service ", serviceName);
		app.server.close(callback);
	};

	app.start(config, routes, serviceName);

	return app;
};

// Expose app
exports.start = start;
