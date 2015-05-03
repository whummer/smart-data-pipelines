'use strict';

var assert = require('assert');
var superagent = require('superagent');
var status = require('http-status');
var test = require('../util/testutil');

var app = {};
/* constants */
var STATUS_PENDING = "PENDING";
var STATUS_CONFIRMED = "CONFIRMED";

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

	it("creates and updates a user's default organization", function(done) {
		test.user1.get(app.organizations.url + "/default").end(function(err, res) {
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

	it("retrieves a user's organizations", function(done) {
		test.user1.get(app.organizations.url + "/").end(function(err, res) {
			assert.ifError(err);
			assert.equal(res.status, status.OK);
			var orgs = res.body;
			assert.equal(true, orgs.length > 0);
			done();
		});
	});

	it("invites a user to an organization", function(done) {
		test.user1.get(app.organizations.url + "/default").end(function(err, res) {
			assert.ifError(err);
			assert.equal(res.status, status.OK);
			var org = res.body;
			var inv = {
					"member": test.user2.user.email,
					"organization-id": org.id
			};
			/* create membership invite */
			test.user1.post(app.organizations.url + "/invite").send(inv).end(function(err, res) {
				var inv1 = res.body;
				assert.equal(inv1.status, STATUS_PENDING);
				/* create membership invite again (should return the same entity) */
				test.user1.post(app.organizations.url + "/invite").send(inv).end(function(err, res) {
					var inv2 = res.body;
					assert.equal(inv2.status, STATUS_PENDING);
					assert.equal(inv1.id, inv2.id);
					/* change membership status (as user2) */
					inv2.status = STATUS_CONFIRMED;
					test.user2.put(app.organizations.url + "/membership").send(inv2).end(function(err, res) {
						var inv3 = res.body;
						assert.equal(inv3.status, STATUS_CONFIRMED);
						assert.equal(inv2.id, inv3.id);
						done();
					});
				});
			});
		});
	});

	it('does not allow a non-admin user to load all organizations', function(done) {
		superagent.get(app.organizations.url + "/all").end(function(err, res) {
			assert.equal(res.status, status.UNAUTHORIZED);
			done();
		});
	});
});
