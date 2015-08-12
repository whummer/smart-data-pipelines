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

	var activate = function(userID, callback) {
		/* activate account */
		var query = {};
		query[USER_ID] = userID;
		/* make sure we don't load the model earlier (because of mockgoose setup) */
		var Activation = require('../../../users-service/api/users/activation.model');
		Activation.find(query, function(err, res) {
			var act = res[0];
			riox.activate(act[ACTIVATION_KEY], function() {
				callback();
			});
		});
	}

	it('can signup and signin if valid data are provided', function(done) {
		var email = "correct@test.com";
		var pass = "test123";
		var user = {email: email, name: "foobar", password: pass};
		riox.signup(user, function(result, statusCode) {
			assert.equal(false, !result.token);
			assert.equal(statusCode, status.OK);
			/* activate account */
			activate(result[USER_ID], function() {
				/* sign in */
				riox.signin(user, function(result, res) {
					assert.equal(false, !result.token);
					assert.equal(true, result.token.length > 10);
					done();
				}, function(err) {
					assert.fail("", err, "Unable to sign in");
				});
			});
		});
	});

	it('cannot signin with invalid credentials', function(done) {
		var email = "correct1@test.com";
		var pass = "test123";
		var userCorrect = {email: email, name: "foobar", password: pass};
		var userIncorrect = {email: email, name: "foobar", password: "incorrect"};
		riox.signup(userCorrect, function(result, statusCode) {
			assert.equal(false, !result.token);
			assert.equal(statusCode, status.OK);
			/* activate account */
			activate(result[USER_ID], function() {
				/* sign in */
				riox.signin(userIncorrect, function(result, statusCode) {
					done(new Error("Access should be denied"));
				}, function(error) {
					done(); // error expected
				});
			})
		});
	});

	it('cannot register a username twice', function(done) {
		var pass = "test123";
		var user = {email: "duplicate@test.com", name: "foobar", password: pass};
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
