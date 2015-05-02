'use strict';

var assert = require('assert');
var superagent = require('superagent');
var status = require('http-status');
var test = require('../util/testutil');
var starters = require('../util/service.starters');
var riox = require('riox-shared/lib/api/riox-api');

var app = {};

describe('/streams', function() {

	before(function(done) {
		/* start service(s) */
		app.streams = starters.startStreamsService();
		/* get auth token */
		test.authDefault(done);
	});

	after(function(done) {
		app.streams.server.stop(done);
	});

	it('returns streams list if we have a valid user', function(done) {
		test.user1.get(app.streams.sources.url).end(function(err, res) {
			assert.ifError(err);
			assert.equal(res.status, status.OK);
			done();
		});
	});

	it('adds a stream source and returns the newly added source', function(done) {
		test.user1.get(app.streams.sources.url).end(function(err, res) {
			assert.ifError(err);
			var numStreams = res.body.length;
			assert.equal(res.status, status.OK);

			var newSource = {};
			newSource[NAME] = "testStream123";
			newSource[ORGANIZATION_ID] = test.user1.orgs.default.id;
			newSource[CONNECTOR] = { "type": "http" };

			test.user1.post(app.streams.sources.url).send(newSource).end(function(err, res) {
				assert.ifError(err);
				assert.equal(res.status, status.OK);
				test.user1.get(app.streams.sources.url).end(function(err, res) {
					assert.ifError(err);
					assert.equal(res.status, status.OK);
					var numStreamsNew = res.body.length;
					assert.equal(numStreams + 1, numStreamsNew)
					done();
				});
			});
		});
	});

	it('returns 401 if no authorization provided', function(done) {
		superagent.get(app.streams.sources.url).end(function(err, res) {
			assert.equal(res.status, status.UNAUTHORIZED);
			done();
		});
	});
});
