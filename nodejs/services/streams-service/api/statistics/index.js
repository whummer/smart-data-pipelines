'use strict';

var express = require('express');
var controller = require('./statistics.controller');
var auth = require('riox-services-base/lib/auth/auth.service');

module.exports = function(app, server) {

	var router = express.Router();

	/* DEFINE WEBSOCKET ROUTE */

	var WebSocketServer = require("ws").Server;
	var wss = new WebSocketServer(
			{server: server, path: "/api/v1/statistics/live", perMessageDeflate : false}
	);
	wss.on('connection', controller.live.connect);

	/* DEFINE ROUTES */

	/* METHODS FOR STREAMS */
	router.post('/invocations', auth.isAuthenticated(), controller.queryInvocationStats);

	return router;
};
