/**
 * Express configuration
 */

'use strict';

var express = require('express');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var compression = require('compression');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var errorHandler = require('errorhandler');
var path = require('path');
var passport = require('passport');
var session = require('express-session');
var config = require('./environment');

function commonConfig(app) {
  app.use(express.static(path.join(config.root, 'static')));
  app.set('appPath', '/');
  //app.use(morgan('dev'));

}

module.exports = function(app) {
  var env = app.get('env');
  app.engine('html', require('ejs').renderFile);
  app.set('view engine', 'html');
  app.use(compression());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(methodOverride());
  app.use(cookieParser());
  app.use(passport.initialize());

  // Persist sessions with mongoStore
  // COMMENTED OUT BY FR - do we need this?
  // We need to enable sessions for passport twitter because its an oauth 1.0 strategy
  // app.use(session({
  //   secret: config.secrets.session,
  //   resave: true,
  //   saveUninitialized: true,
  //   store: new mongoStore({ mongoose_connection: mongoose.connection })
  // }));

  if ('production' === env) {
    commonConfig(app);
  }

  if ('development' === env || 'test' === env) {
    commonConfig(app);
    //app.use(errorHandler()); // Error handler - has to be last
  }
};
