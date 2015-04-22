'use strict';

var assert = require('assert');
var superagent = require('superagent');
var mongoose = require('mongoose');
var mockgoose = require('mockgoose');
var status = require('http-status');
var test = require('../util/testutil');
var usersClient = require('_/api/users.client');

var app = {};

describe('/users', function() {

	before(function(done) {
		/* get auth token */
		mockgoose(mongoose);
		/* start streams service */
		app.users = { port : 3003 };
		app.users.url = "http://localhost:" + app.users.port + "/api/v1/users";
		process.env.SERVICE_PORT = app.users.port;
		app.users.server = require('../../../users-service/app.js').start();
		/* get auth token */
		test.authDefault(done);
	});

	after(function() {
		app.users.server.stop();
	});

	it('cannot register a username twice', function(done) {
		var user = {email: "foobar", name: "foobar", password: "foobar"};
		usersClient.signup(user, {}, function(result, res) {
			assert.equal(res.statusCode, status.OK);
			usersClient.signup(user, {}, function(result, res) {
				assert.notEqual(res.statusCode, status.OK);
				done();
			});
		});
	});

});