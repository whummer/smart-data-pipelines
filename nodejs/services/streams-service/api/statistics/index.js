'use strict';

var express = require('express');
var controller = require('./statistics.controller');
var auth = require('riox-services-base/lib/auth/auth.service');

var router = express.Router();

module.exports = function(app, server) {

	/* define websocket route */

	var WebSocketServer = require("ws").Server;
	var wss = new WebSocketServer(
			{server: server, path: "/api/v1/statistics/live"}
	);
	wss.on('connection', controller.live.connect);

	/* define routes */

	return router;
};
