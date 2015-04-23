'use strict';

var assert = require('assert');
var superagent = require('superagent');
var status = require('http-status');
var test = require('../util/testutil');

var app = {};

describe('/stream/access', function() {

	before(function(done) {
		/* start streams/access service */
		app.access = { port : 3000 };
		app.streams = { port : 3000 };
		process.env.SERVICE_PORT = app.access.port;
		app.access.server = require('../../../streams-service/app.js').start();
		/* set URLs */
		app.access.url = global.servicesConfig.services.access.url = "http://localhost:" + app.access.port + "/api/v1/access";
		app.streams.url = global.servicesConfig.services.streams.url = "http://localhost:" + app.streams.port + "/api/v1/streams";
		/* get auth token */
		test.authDefault(done);
	});

	after(function() {
		app.access.server.stop();
	});

	it('adds a stream and requests access to the newly added stream', function(done) {
		test.user1.post(app.streams.url).send(
				{name: "testStream456"}
			).end(function(err, res) {
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