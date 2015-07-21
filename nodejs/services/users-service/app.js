/**
 * Main application file
 */

'use strict';

//Set default environment
process.env.RIOX_ENV = process.env.RIOX_ENV || "development";
process.env.NODE_ENV = process.env.RIOX_ENV == "development" ? "development" : "production";

// load config
var riox = require("riox-shared/lib/api/riox-api");
var config = require("./config/environment");
config.port = process.env.SERVICE_PORT || 8084;
global.config = require("riox-services-base/lib/config/merge")(global.config, config);

// require service starter
var starter = require("riox-services-base/lib/service.starter");

// Populate DB with sample data
if(config.seedDB) { require("./demodata"); }

// start server
var routes = require("./routes");
var server = starter.start(config, routes, "users-service");

// initialize passport
var passport = require("passport");
server.expressApp.use(passport.initialize());

module.exports = server;
