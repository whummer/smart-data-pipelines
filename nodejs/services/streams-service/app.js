/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var mongoose = require('mongoose');
var cors = require('cors');
var config = require('./config/environment');
var util = require('_/util/util');

global.config = config;
if(!global.servicesConfig) {
	global.servicesConfig = require('_/config/services');
}

//TODO find better place to configure port for microservices
config.port = process.env.SERVICE_PORT || 8085;

// Connect to database
try {
	mongoose.connect(config.mongo.uri, config.mongo.options);
} catch(e) {
	console.log("Mongo connection already established.")
}

// Populate DB with sample data
if(config.seedDB) { require('./demodata'); }

// Setup server
var app = express();
app.use(cors());
var server = app.server = require('http').createServer(app);
require('./config/express')(app);
require('./routes')(app);

// Start server
app.start = function() {
	if(app.started) return app;
	server.listen(config.port, config.ip, function () {
		app.started = true;
		console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
	});
	return app;
}
app.stop = function() {
	if(!app.started) return;
	app.started = false;
	server.close();
}
app.start();

// Expose app
module.exports = app;
