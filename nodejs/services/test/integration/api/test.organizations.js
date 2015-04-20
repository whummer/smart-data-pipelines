'use strict';

var assert = require('assert');
var superagent = require('superagent');
var mongoose = require('mongoose');
var mockgoose = require('mockgoose');
var status = require('http-status');
var test = require('../util/testutil');

var app = {};

describe('/organizations', function() {

	before(function(done) {
		/* get auth token */
		mockgoose(mongoose);
		/* start streams service */
		app.organizations = { port : 3000 };
		app.organizations.url = "http://localhost:" + app.organizations.port + "/api/v1/streams";
		process.env.SERVICE_PORT = app.organizations.port;
		app.organizations.server = require('../../../streams-service/app.js').start();
		/* get auth token */
		test.authDefault(done);
	});

	after(function() {
		app.organizations.server.stop();
	});

	it('updates a users own organization', function(done) {
		
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
			test.user1.post(app.streams.url).send(
					{name: "testStream123"}
				).end(function(err, res) {
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