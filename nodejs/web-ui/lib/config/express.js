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
var auth = require('riox-services-base/lib/auth/auth.service');

var setupDefaults = function(app) {
	app.use("/app/views/admin", auth.isAuthenticated());
	app.use(checkAuth);
	app.use(express.static(config.root));
	app.set('appPath', path.resolve("."));
};

var checkAuth = function(req, res, next) {
	//console.log("checkAuth", req.path);
	for(var i = 0; i < config.allowedPaths.length; i ++) {
		var path = config.allowedPaths[i];
		if(req.path === path) {
			/* permitted */
			return next();
		}
	}
	for(var i = 0; i < config.allowedPathStarts.length; i ++) {
		var start = config.allowedPathStarts[i];
		if(req.path.indexOf(start) === 0) {
			/* permitted */
			return next();
		}
	}
	/* denied */
	return res.status(404).send();
};

module.exports = function(app) {
	var env = app.get('env');
	app.set('view engine', 'html');
	app.use(compression());
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(bodyParser.json());
	app.use(methodOverride());
	app.use(cookieParser());
	
	/* enable basic auth: */
	//var basicAuth = require('node-basicauth');
	//app.use(basicAuth({"riox": "rioxRocks!"}));

	// todo om: either switch this to '/lib' or adapt gulpfile for /public structure
	if ('production' === env) {
		app.use(favicon(path.join(config.root, 'public', 'favicon.ico')));
		setupDefaults(app);
		//app.use(morgan('dev'));
	}

	if ('development' === env || 'test' === env) {
		setupDefaults(app);
		//app.use(morgan('dev'));
		//app.use(errorHandler()); // Error handler - has to be last
	}

	if ('development' === env ) {
		//app.use(require('connect-livereload')());
		app.use(express.static(path.join(config.root, 'lib')));
		app.set('appPath', path.resolve(__dirname + "/../"));
	}

};
