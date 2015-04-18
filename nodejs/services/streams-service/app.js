/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var mongoose = require('mongoose');
var cors = require('cors');
var config = require('../lib/config/environment');

/* globals */
global.config = config;

//TODO find better place to configure port for microservices
config.port = 8085;

// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);
global.mongooseAutoIncrement = require('mongoose-auto-increment');
global.mongooseAutoIncrement.initialize(mongoose.connection);

// Populate DB with sample data
if(config.seedDB) { require('./demodata'); }

// Setup server
var app = express();
app.use(cors());
var server = require('http').createServer(app);
require('../lib/config/express')(app);
require('./routes')(app);
 
// Start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;
