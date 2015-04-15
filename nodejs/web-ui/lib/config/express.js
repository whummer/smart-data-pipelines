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
var config = require('./environment');
// var passport = require('passport');
var session = require('express-session');
// var mongoStore = require('connect-mongo')(session);
// var mongoose = require('mongoose');

module.exports = function(app) {
  var env = app.get('env');

  app.set('views', config.root + '/app/views');
  app.engine('html', require('ejs').renderFile);
  app.set('view engine', 'html');
  app.use(compression());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(methodOverride());
  app.use(cookieParser());
  // app.use(passport.initialize());

  // Persist sessions with mongoStore
  // COMMENTED OUT BY FR - do we need this?
  // We need to enable sessions for passport twitter because its an oauth 1.0 strategy
  // app.use(session({
  //   secret: config.secrets.session,
  //   resave: true,
  //   saveUninitialized: true,
  //   store: new mongoStore({ mongoose_connection: mongoose.connection })
  // }));

  // todo om: either switch this to '/lib' or adapt gulpfile for /public structure
  if ('production' === env) {
    app.use(favicon(path.join(config.root, 'public', 'favicon.ico')));
    app.use(express.static(path.join(config.root, 'public')));
    app.set('appPath', config.root + '/public');
    app.use(morgan('dev'));
  }

  if ('development' === env || 'test' === env) {
    app.use(express.static(path.join(config.root, '.tmp')));
    app.use(express.static(path.join(config.root, 'lib')));
    app.set('appPath', 'lib');
    app.use(morgan('dev'));
    app.use(errorHandler()); // Error handler - has to be last
  }

  if ('development' === env ) {
    //app.use(require('connect-livereload')());
  }
    
};