'use strict';

var express = require('express');
var controller = require('./forward.controller');
var auth = require('riox-services-base/lib/auth/auth.service');
var compose = require('composable-middleware');

module.exports = function(app, server) {

	/* DEFINE PROXY FORWARDING ROUTES */

	function defineProxy (proxyPath, func) {
		app.use(function (req, res, next) {
			var path = req._parsedUrl.path;
			if(path.indexOf(proxyPath) === 0) {
				func(req, res, next);
			} else {
				next();
			}
		});
	}

	defineProxy("/api/v1/gateway/elasticsearch", function(req, res, next) {
		compose()
		.use(
			auth.isAuthenticated(),
			auth.fetchOrgs(),
			controller.proxyElasticsearch
		)(req, res, next);
	});

};
