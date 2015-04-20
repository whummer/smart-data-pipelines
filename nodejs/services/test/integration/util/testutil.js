'use strict';

var assert = require('assert');
var superagent = require('superagent');
var mongoose = require('mongoose');
var mockgoose = require('mockgoose');
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
	superagent.post(services.users.url + "/auth/local").
		send(
			{name: "test", email: email, password: pass}
		).
		end(
		function(err, res) {
			assert.ifError(err);
			assert.equal(res.status, status.OK);
			callback(res);
		});
}

app.auth = function(email, pass, callback) {
	mockgoose(mongoose);

	services.users = { port: 3001 }
	services.users.url = "http://localhost:" + services.users.port + "/api/v1/users";
	process.env.SERVICE_PORT = services.users.port;
	services.users.server = require('../../../users-service/app.js');

	attemptLogin(email, pass, callback);
}

module.exports = app;
