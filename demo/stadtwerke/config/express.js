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
var session = require('express-session');

function setupDefaults(app) {
 app.use(express.static(config.root));
 app.set('appPath', path.resolve("."));
}

module.exports = function(app) {
  var env = app.get('env');
  app.set('view engine', 'html');
  app.use(compression());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(methodOverride());
  app.use(cookieParser());

  if ('production' === env) {
    app.use(favicon(path.join(config.root, 'public', 'favicon.ico')));
    setupDefaults(app);
  }

  if ('development' === env || 'test' === env) {
    setupDefaults(app);
  }

  if ('development' === env ) {
    app.use(express.static(path.join(config.root, 'lib')));
    app.set('appPath', path.resolve(__dirname + "/../"));
  }

};
