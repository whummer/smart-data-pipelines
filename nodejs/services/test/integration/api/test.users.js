'use strict';

var assert = require('assert');
var superagent = require('superagent');
var status = require('http-status');
var test = require('../util/testutil');
var riox = require('riox-shared/lib/api/riox-api');

var app = {};

describe('/users', function() {

	before(function(done) {
		/* start streams service */
		app.users = { port : 3001 };
		app.users.url = "http://localhost:" + app.users.port + "/api/v1/users";
		process.env.SERVICE_PORT = app.users.port;
		app.users.server = require('../../../users-service/app.js').start();
		/* get auth token */
		test.authDefault(done);
	});

	after(function() {
		app.users.server.stop();
	});

	it('can signup and signin if valid data are provided', function(done) {
		var email = "correct@test.com";
		var pass = "foobar";
		var user = {email: email, name: "foobar", password: pass};
		riox.signup(user, function(result, statusCode) {
			assert.equal(false, !result.token);
			assert.equal(statusCode, status.OK);
			riox.signin(user, function(result, res) {
				assert.equal(false, !result.token);
				assert.equal(true, result.token.length > 10);
				done();
			});
		});
	});

	it('cannot signin with invalid credentials', function(done) {
		var email = "correct1@test.com";
		var pass = "foobar";
		var userCorrect = {email: email, name: "foobar", password: pass};
		var userIncorrect = {email: email, name: "foobar", password: "incorrect"};
		riox.signup(userCorrect, function(result, statusCode) {
			assert.equal(false, !result.token);
			assert.equal(statusCode, status.OK);
			riox.signin(userIncorrect, function(result, statusCode) {
				assert.equal(true, !result.token);
				assert.notEqual(statusCode, status.OK);
				done();
			});
		});
	});

	it('cannot register a username twice', function(done) {
		var user = {email: "duplicate@test.com", name: "foobar", password: "foobar"};
		riox.signup(user, function(result, statusCode) {
			assert.equal(false, !result.token);
			assert.equal(statusCode, status.OK);
			riox.signup(user, function(result, statusCode) {
				assert.notEqual(statusCode, status.OK);
				assert.equal(true, !result.token);
				done();
			});
		});
	});

});