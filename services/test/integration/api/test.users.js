'use strict';

var assert = require('assert');
var superagent = require('superagent');
var status = require('http-status');
var test = require('../util/testutil');
var starters = require('../util/service.starters');
var riox = require('riox-shared/lib/api/riox-api');

var app = {};

describe('/users', function() {

	before(function(done) {
		/* start service(s) */
		app.users = starters.startUsersService();
		/* get auth token */
		test.authDefault(done);
	});

	after(function(done) {
		app.users.server.stop(done);
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
				done(new Error("Access should be denied"));
			}, function(error) {
				done(); // error expected
			});
		});
	});

	it('cannot register a username twice', function(done) {
		var user = {email: "duplicate@test.com", name: "foobar", password: "foobar"};
		riox.signup(user, function(result, statusCode) {
			assert.equal(false, !result.token);
			assert.equal(statusCode, status.OK);
			riox.signup(user, function(result, statusCode) {
				done(new Error("Duplicate signup should be denied"));
			}, function(error) {
				done(); // error expected
			});
		});
	});

});
