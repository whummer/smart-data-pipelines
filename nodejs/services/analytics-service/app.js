/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || "development";

// load config
var config = require("./config/environment");
config.port = process.env.SERVICE_PORT || 8086;
global.config = require("riox-services-base/lib/config/merge")(global.config, config);
//console.log("analytics config", global.config);

// require service starter
var starter = require("riox-services-base/lib/service.starter");

// Populate DB with sample data
if(config.seedDB) { require("./config/analytics_functions"); }

// start server
var routes = require("./routes");
var server = starter.start(config, routes, "analytics-service");

module.exports = server;

