/**
 * Main application file
 */

'use strict';

// Set default environment
process.env.RIOX_ENV = process.env.RIOX_ENV || "development";
process.env.NODE_ENV = process.env.RIOX_ENV == "development" ? "development" : "production";

//load config
var riox = require('riox-shared/lib/api/riox-api');
var config = require("./config/environment");
config.port = process.env.SERVICE_PORT || 8087;
global.config = require("riox-services-base/lib/config/merge")(global.config, config);

// require service starter
var starter = require("riox-services-base/lib/service.starter");

//start server
var routes = require("./routes");
var server = starter.start(config, routes, "files-service");

module.exports = server;
