'use strict';

var assert = require('assert');
var superagent = require('superagent');
var status = require('http-status');
var test = require('../util/testutil');

var app = {};

describe('/organizations', function() {

	before(function(done) {
		/* start streams service */
		app.organizations = { port : 3001 };
		app.organizations.url = "http://localhost:" + app.organizations.port + "/api/v1/organizations";
		process.env.SERVICE_PORT = app.organizations.port;
		app.organizations.server = require('../../../users-service/app.js').start();
		/* get auth token */
		test.authDefault(done);
	});

	after(function() {
		app.organizations.server.stop();
	});

	it("updates a user's own organization, only its own", function(done) {
		test.user1.get(app.organizations.url + "/own").end(function(err, res) {
			assert.ifError(err);
			assert.equal(res.status, status.OK);
			var org = res.body;
			test.user2.put(app.organizations.url + "/" + org.id).send(org).end(function(err, res) {
				assert.equal(false, !err);
				test.user1.put(app.organizations.url + "/" + org.id).send(org).end(function(err, res) {
					assert.ifError(err);
					done();
				});
			});
		});
	});

	it('returns 401 if no authorization provided', function(done) {
		superagent.get(app.organizations.url).end(function(err, res) {
			assert.equal(res.status, status.UNAUTHORIZED);
			done();
		});
	});
});