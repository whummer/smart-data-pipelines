'use strict';

var assert = require('assert');
var superagent = require('superagent');
var status = require('http-status');
var test = require('../util/testutil');
var starters = require('../util/service.starters');
var riox = require('riox-shared/lib/api/riox-api');
var util = require('util');

var app = {};

describe('/consents', function() {

	before(function(done) {
		/* start service(s) */
		app.streams = starters.startStreamsService();
		app.consents = starters.startStreamsConsentsService();
		/* get auth token */
		test.authDefault(done);
	});

	after(function(done) {
		app.consents.server.stop(function() {
			app.streams.server.stop(done);
		});
	});

	it('adds a stream source, creates a consent requests for the newly added source', function(done) {

		var newSource = {};
		newSource[NAME] = "testStream456";
		newSource[ORGANIZATION_ID] = test.user1.orgs.default.id;
		newSource[CONNECTOR] = { "type": "http" };

		test.user1.post(app.streams.sources.url).send(newSource).end(function(err, res) {
			var sourceId = res.body.id;
			assert.ifError(err);
			assert.equal(res.status, status.OK);
			test.user1.get(app.consents.url).end(function(err, res) {

				assert.ifError(err);
				assert.equal(res.status, status.OK);
				assert.equal(0, res.body.length);
				var consent = {};
				consent[SOURCE_ID] = sourceId;
				consent[CONSENTOR_ID] = test.user1.orgs.default.id;
				consent[REQUESTOR_ID] = test.user2.orgs.default.id;

				test.user2.
				post(app.consents.url).
				send(consent).end(function(err, res) {
					assert.ifError(err);
					assert.equal(res.status, status.OK);
					assert.equal(sourceId, res.body[SOURCE_ID]);
					assert.equal(true, res.body[REQUESTOR_ID].length > 0);
					done();
				});
			});
		});
	});

});
