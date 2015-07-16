/**
 * Express configuration
 */

'use strict';

var express = require('express');
var morgan = require('morgan');
var compression = require('compression');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var errorHandler = require('errorhandler');
var path = require('path');
var session = require('express-session');
var config = require('./environment');

function commonConfig(app) {
  app.use(express.static(path.join(config.root, 'static')));
  app.set('appPath', '/');
  app.use(morgan('dev'));
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

  if ('production' === env) {
    commonConfig(app);
  }

  if ('development' === env || 'test' === env) {
    commonConfig(app);
  }
};
