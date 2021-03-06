/**
 * Main application file
 */

'use strict';

//Set default environment
process.env.RIOX_ENV = process.env.RIOX_ENV || "development";
process.env.NODE_ENV = process.env.RIOX_ENV == "development" ? "development" : "production";

var express = require('express');
var cors = require('cors');
var util = require('./util/util');
var expressWinston = require('express-winston');
var log = global.log = require('winston');
var errorHandler = require('./util/errors/handler');

require('./api/service.calls');

var mongoose = global.mongoose || require('mongoose-q')();
if (!global.mongoose) {
	global.mongoose = mongoose;
}
if (!global.servicesConfig && global.config) {
	global.servicesConfig = global.config.services;
}

/* Add DNS caching to avoid unnecessary bursting of our DNS system */
require('dnscache')({
	"enable" : true,
	"ttl" : 10, /* Very short TTL so we don't end up using outdated entries */
	"cachesize" : 1000
});

/* any status codes >= (gte) to this one will be logged as errors */
var STATUS_CODE_LOGERROR_START = 405; /* */

var start = function (config, routes, serviceName) {

	var app = {};

	function configureRequestLogger(config, requestLogging, expressApp) {
		log.remove(log.transports.Console).add(log.transports.Console, config.logging);

		if (config.logging.requestLogging) {
			requestLogging = true;

			var requestLogger = null;
			if (config.logging.requestLogging.logAllRequests) {
				requestLogger = expressWinston.logger({
					transports: [
						new log.transports.Console({
							json: false,
							timestamp: true,
							colorize: true
						})
					],
					expressFormat: true,
					meta: config.logging.requestLogging.logMeta
				});
			}

			var errorDetailsLogger = expressWinston.logger({
				transports: [
					new log.transports.Console({
						json: false,
						timestamp: true,
						colorize: true
					})
				],
				expressFormat: true,
				meta: false
			});

			expressApp.use(function (req, res, next) {
				var end = res.end;
				res.end = function (chunk, encoding) {
					res.end = end;
					if (res.end) res.end(chunk, encoding);
					var emptyNext = function () {
					};

					if (res.statusCode < STATUS_CODE_LOGERROR_START) {
						if(requestLogger)
							requestLogger(req, res, emptyNext);
					} else {
						errorDetailsLogger(req, res, emptyNext);
					}
					res.end(); // needed to trigger the callback function in winston-express logger
				};
				next();
			});
		}
		return requestLogging;
	}

	function configureErrorRequestLogging(expressApp) {
		log.remove(log.transports.Console).add(log.transports.Console, config.logging);
		log.info("Enabling error request logging");

		var errorDetailsLogger = expressWinston.errorLogger({
			transports: [
				new log.transports.Console({
					json: true,
					timestamp: true,
					colorize: true
				})
			]
		});

		//
		// FR: add a global error handler so we see problems on the console.
		//
		function logErrors(err, req, res, next) {
			log.error(err.stack);
			next(err);
		}
		expressApp.use(logErrors);

		expressApp.use(function(err, req, res, next) {
			var emptyNext = function(){};
			if (res.statusCode >= STATUS_CODE_LOGERROR_START) {
				errorDetailsLogger(err, req, res, emptyNext);
			}
			//next();
		});

	}

	app.start = function (config, routes, serviceName, overrideExpressVersion) {

		if (app.started) {
			return app;
		}

		var expressToUse = overrideExpressVersion || express;

		// Setup server
		var expressApp = app.expressApp = expressToUse();
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
				if (log) log.info("Using TEST mode (mockgoose)");
				var mockgoose = require('mockgoose');
				mockgoose(mongoose);
				//mongoose.connect("");
				mongoose.__mockgooseHasBeenApplied = true;
			}
		} else {
			var reconnectTimeout = 1000*10;
			var doConnect = function() {
				mongoose.connect(config.mongo.uri, config.mongo.options);
			}
			var db = mongoose.connection;
			db.on('error', function(error) {
				log.warn("Unable to connect to database (MongoDB):", config.mongo.uri, 
						". Re-connecting in " + reconnectTimeout + "ms");
				setTimeout(doConnect, reconnectTimeout);
			});
			doConnect();
		}

		//
		// configure winston logger @todo think about if we should put this in express.js
		// This one has to go BEFORE the routes are loaded
		//
		var requestLogging = false;
		if (log && config.logging) {
			requestLogging = configureRequestLogger(config, requestLogging, expressApp);
		}

		// gets the Url to simply construct Location headers
		expressApp.use(function(req, res, next) {
			req.getUrl = function() {
				return req.protocol + "://" + req.get('host') + req.originalUrl;
			}
			return next();
		});

		var server = app.server = require('http').createServer(expressApp);
		var expressConfig = require("./config/express");
		if(routes.preload) {
			routes.preload(expressApp, server);
		}
		expressConfig(expressApp, config);
		routes(expressApp, server);

		// install our custom error handler AFTER the routes are loaded
		expressApp.use(errorHandler);

		// install error request logger last
		if (requestLogging && config.logging.requestLogging.logErrorRequests) {
			configureErrorRequestLogging(expressApp);
		}

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
