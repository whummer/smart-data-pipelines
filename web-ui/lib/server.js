/**
 * Main file for webui
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var config = global.config = require('./config/environment');
var riox = require('riox-shared/lib/api/riox-api');
var log = global.log = require('winston');

// Setup server
var app = express();
var server = require('http').createServer(app);
require('./routes')(app);
require('./config/express')(app);

// Start server
server.listen(config.port, config.ip, function () {
	log.info('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Expose app
module.exports = app;
