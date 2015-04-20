'use strict';

var assert = require('assert');
var superagent = require('superagent');
var mongoose = require('mongoose');
var mockgoose = require('mockgoose');
var status = require('http-status');
var testUtil = require('../util/testutil');

describe('/streams', function() {
	var app = {};

	before(function(done) {
		mockgoose(mongoose);
		testUtil.auth("riox", "riox", function(res) {
			app.tokenHeaders = { authorization: "Bearer " + res.body.token };
			done();
		});

		app.streams = { port: 3000 }
		app.streams.url = "http://localhost:" + app.streams.port + "/api/v1/streams";
		process.env.SERVICE_PORT = app.streams.port;
		app.streams.server = require('../../../streams-service/app.js').server;
	});

	after(function() {
		app.streams.server.close();
	});

	it('returns streams list if we have a valid user', function(done) {
		superagent.get(app.streams.url).
				set("authorization", app.tokenHeaders.authorization).
				end(
				function(err, res) {
					assert.ifError(err);
					assert.equal(res.status, status.OK);
					done();
				});
	});

	it('returns 401 if no authorization provided', function(done) {
		superagent.get(app.streams.url).end(
				function(err, res) {
					assert.equal(res.status, status.UNAUTHORIZED);
					done();
				});
	});
});