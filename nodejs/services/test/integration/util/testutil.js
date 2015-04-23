'use strict';

var assert = require('assert');
var superagent = require('superagent');
var status = require('http-status');

var app = {};
var services = {};

var attemptLogin = function(email, pass, callback) {
	superagent.post(services.users.url + "/auth/local").send(
			{email: email, password: pass}
		).
		//set('Accept', 'application/json').
		end(
		function(err, res) {
			if(err && err.status == 401) {
				registerUser(email, pass, callback);
				return;
			}
			assert.ifError(err);
			assert.equal(res.status, status.OK);
			callback(res);
		});
}

var registerUser = function(email, pass, callback) {
	superagent.post(services.users.url).
		send(
			{name: email, email: email, password: pass}
		).
		end(
		function(err, res) {
			assert.ifError(err);
			assert.equal(res.status, status.OK);
			callback(res);
		});
}


var initClientProxy = function(proxy) {
	proxy.get = function(url) {
		return superagent.get(url).set("authorization",
				proxy.tokenHeaders.authorization);
	}
	proxy.post = function(url) {
		return superagent.post(url).set("authorization",
				proxy.tokenHeaders.authorization);
	}
}

app.auth = function(email, pass, callback) {

	services.users = { port: 3001 }
	services.organizations = { port: 3001 }
	process.env.SERVICE_PORT = services.users.port;
	services.users.server = require('../../../users-service/app.js');
	/* set URLs */
	services.users.url = global.servicesConfig.services.users.url = 
		"http://localhost:" + services.users.port + "/api/v1/users";
	services.organizations.url = global.servicesConfig.services.organizations.url = 
		"http://localhost:" + services.users.port + "/api/v1/organizations";
	/* do login */
	attemptLogin(email, pass, callback);
}

app.authDefault = function(callback) {
	if(app.user1 && app.user2) {
		if(callback) callback();
		return;
	}

	app.auth("user1", "user1", function(res) {
		app.user1 = {
			tokenHeaders : {
				authorization : "Bearer " + res.body.token
			}
		};
		initClientProxy(app.user1);

		app.auth("user2", "user2", function(res) {
			app.user2 = {
				tokenHeaders : {
					authorization : "Bearer " + res.body.token
				}
			};
			initClientProxy(app.user2);

			if(callback) callback();
		});
	});
}

module.exports = app;
