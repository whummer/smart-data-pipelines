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

module.exports = function(app, config) {
	var env = app.get('env');

	//app.set('views', config.root + '/app/views');
	app.engine('html', require('ejs').renderFile);
	app.set('view engine', 'html');
	app.use(compression());
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(bodyParser.json({strict: true, verify: function(req, res, buf, encoding) {
		if(["POST", "PUT"].indexOf(req.method) >= 0 && buf.toString() === "") {
			var msg = "Invalid (empty) request body";
			res.status(400).json({error: msg});
			throw msg;
		}
	}}));
	app.use(methodOverride());
	app.use(cookieParser());

	function commonConfig(app) {
		app.use(express.static(path.join(config.root, 'static')));
		app.set('appPath', '/');
		//app.use(morgan('dev'));
	}

	if ('production' === env) {
		commonConfig(app);
	}

	if ('development' === env || 'test' === env) {
		commonConfig(app);
		//app.use(errorHandler()); // Error handler - has to be last
	}

};
