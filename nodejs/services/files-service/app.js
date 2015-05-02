/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || "development";

// configure port for microservices
process.env.SERVICE_PORT = process.env.SERVICE_PORT || 8087;

// load config
var config = require("./config/environment");

// require service starter
var starter = require("riox-services-base/lib/service.starter");

// start server
var routes = require("./routes");
starter.start(config, routes);

module.exports = starter;
