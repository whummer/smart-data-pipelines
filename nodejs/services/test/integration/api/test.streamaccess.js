'use strict';

var assert = require('assert');
var superagent = require('superagent');
var status = require('http-status');
var test = require('../util/testutil');
var starters = require('../util/service.starters');

var app = {};

describe('/stream/access', function() {

	before(function(done) {
		/* start service(s) */
		app.streams = starters.startStreamsService();
		app.access = starters.startStreamsAccessService();
		/* get auth token */
		test.authDefault(done);
	});

	after(function() {
		app.access.server.stop();
	});

	it('adds a stream and requests access to the newly added stream', function(done) {

		var newStream = {
				"name": "testStream456",
				"sink-config": { connector: "http" }
		}

		test.user1.post(app.streams.url).send(newStream).end(function(err, res) {
			var streamId = res.body.id;
			assert.ifError(err);
			assert.equal(res.status, status.OK);
			test.user1.get(app.access.url).end(function(err, res) {
				assert.ifError(err);
				assert.equal(res.status, status.OK);
				assert.equal(0, res.body.length);
				var accessRequest = {streamId : streamId};
				//console.log("accessRequest", accessRequest);
				test.user2.
				post(app.access.url).
				send(accessRequest).end(function(err, res) {
					assert.ifError(err);
					//console.log("err", err, res);
					assert.equal(res.status, status.OK);
					assert.equal(streamId, res.body.streamId);
					assert.equal(true, res.body.requestorId.length > 0);
					done();
				});
			});
		});
	});

});
