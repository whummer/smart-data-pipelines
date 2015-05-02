'use strict';

var assert = require('assert');
var superagent = require('superagent');
var status = require('http-status');
var test = require('../util/testutil');
var starters = require('../util/service.starters');

var app = {};

describe('/streams', function() {

	before(function(done) {
		/* start service(s) */
		app.streams = starters.startStreamsService();
		/* get auth token */
		test.authDefault(done);
	});

	after(function() {
		app.streams.server.stop();
	});

	it('returns streams list if we have a valid user', function(done) {
		test.user1.get(app.streams.url).end(function(err, res) {
			assert.ifError(err);
			assert.equal(res.status, status.OK);
			done();
		});
	});

	it('adds a stream and returns the newly added stream', function(done) {
		test.user1.get(app.streams.url).end(function(err, res) {
			assert.ifError(err);
			var numStreams = res.body.length;
			assert.equal(res.status, status.OK);

			var newStream = {
					"name": "testStream123",
					"sink-config": { connector: "http" }
			}

			test.user1.post(app.streams.url).send(newStream).end(function(err, res) {
				assert.ifError(err);
				assert.equal(res.status, status.OK);
				test.user1.get(app.streams.url).end(function(err, res) {
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
		superagent.get(app.streams.url).end(function(err, res) {
			assert.equal(res.status, status.UNAUTHORIZED);
			done();
		});
	});
});
