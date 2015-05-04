'use strict';

var assert = require('assert');
var superagent = require('superagent');
var status = require('http-status');
var test = require('../util/testutil');
var starters = require('../util/service.starters');
var riox = require('riox-shared/lib/api/riox-api');

var app = {};

describe('/stream/access', function() {

	before(function(done) {
		/* start service(s) */
		app.streams = starters.startStreamsService();
		app.access = starters.startStreamsAccessService();
		/* get auth token */
		test.authDefault(done);
	});

	after(function(done) {
		app.access.server.stop(function() {
			app.streams.server.stop(done);
		});
	});

	it('adds a stream source and requests access to the newly added source', function(done) {

		var newSource = {};
		newSource[NAME] = "testStream456";
		newSource[ORGANIZATION_ID] = test.user1.orgs.default.id;
		newSource[CONNECTOR] = { "type": "http" };

		test.user1.post(app.streams.sources.url).send(newSource).end(function(err, res) {
			var sourceId = res.body.id;
			assert.ifError(err);
			assert.equal(res.status, status.OK);
			test.user1.get(app.access.url).end(function(err, res) {
				assert.ifError(err);
				assert.equal(res.status, status.OK);
				assert.equal(0, res.body.length);
				var accessRequest = {};
				accessRequest[SOURCE_ID] = sourceId;
				//console.log("accessRequest", accessRequest);
				test.user2.
				post(app.access.url).
				send(accessRequest).end(function(err, res) {
					assert.ifError(err);
					//console.log("err", err, res);
					assert.equal(res.status, status.OK);
					assert.equal(sourceId, res.body[SOURCE_ID]);
					assert.equal(true, res.body[REQUESTOR_ID].length > 0);
					done();
				});
			});
		});
	});

});
