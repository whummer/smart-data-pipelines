'use strict';

var assert = require('assert');
var superagent = require('superagent');
var status = require('http-status');
var test = require('../util/testutil');
var starters = require('../util/service.starters');
var riox = require('riox-shared/lib/api/riox-api');

var app = {};

describe('/organizations', function() {

	before(function(done) {
		/* start service(s) */
		app.organizations = starters.startOrganizationsService();
		/* get auth token */
		test.authDefault(done);
	});

	after(function(done) {
		app.organizations.server.stop(done);
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

	it("does not create the default organization twice", function(done) {
		test.user1.get(app.organizations.url + "/default").end(function(err, res) {
			assert.ifError(err);
			assert.equal(res.status, status.OK);
			var org1 = res.body;
			test.user1.get(app.organizations.url + "/default").end(function(err, res) {
				assert.ifError(err);
				assert.equal(res.status, status.OK);
				var org2 = res.body;
				assert.equal(org1.id, org2.id);
				done();
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
			test.user1.post(app.organizations.url + "/" + org.id + "/invite").send(inv).end(function(err, res) {
				var inv1 = res.body;
				assert.equal(inv1.status, STATUS_PENDING);
				/* create membership invite again (should return the same entity) */
				test.user1.post(app.organizations.url + "/" + org.id + "/invite").send(inv).end(function(err, res) {
					var inv2 = res.body;
					assert.equal(inv2.status, STATUS_PENDING);
					assert.equal(inv1.id, inv2.id);
					/* change membership status (as user2) */
					inv2.status = STATUS_CONFIRMED;
					test.user2.put(app.organizations.url + "/memberships/" + inv2.id).send(inv2).end(function(err, res) {
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
