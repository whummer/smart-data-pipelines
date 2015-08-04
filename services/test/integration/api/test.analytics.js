'use strict';

var assert = require('assert');
var superagent = require('superagent');
var status = require('http-status');
var test = require('../util/testutil');
var starters = require('../util/service.starters');

var app = {};

describe('/analytics', function() {

	before(function(done) {
		/* start streams service */
		app.analytics = starters.startAnalyticsService(function() {
			/* get auth token */
			test.authDefault(done);
		});
	});

	after(function() {
		app.analytics.server.stop();
	});

	it("returns a list of available analytics functions ", function(done) {

		test.user1.get(app.analytics.url).end(function(err, res) {
			log.debug(JSON.stringify(res.body));

			var analyticsFuncs = res.body;

			assert.equal(2, analyticsFuncs.length);


			var movingFunc = analyticsFuncs[0]
			assert.equal(movingFunc.name, "moving_function");
			assert.equal(movingFunc.input.length, 3);
			assert.equal(movingFunc.input[0].key, "itemPath");
			assert.equal(movingFunc.input[1].key, "items");
			assert.equal(movingFunc.input[2].key, "function");

			assert.equal(movingFunc.output.length, 1);
			assert.equal(movingFunc.output[0].key, "riox-analytics.moving_function");


			var geoFenceFunc = analyticsFuncs[1];
			assert.equal(geoFenceFunc.name, "geo_fence_circular");
			assert.equal(geoFenceFunc.input.length, 5);
			assert.equal(geoFenceFunc.input[0].key, "latitude");
			assert.equal(geoFenceFunc.input[1].key, "longitude");
			assert.equal(geoFenceFunc.input[2].key, "radius");
			assert.equal(geoFenceFunc.input[3].key, "latPath");
			assert.equal(geoFenceFunc.input[4].key, "longPath");

			assert.equal(geoFenceFunc.output.length, 1);
			assert.equal(geoFenceFunc.output[0].key, "riox-analytics.inside_geofence");


			assert.ifError(err);
			assert.equal(res.status, status.OK);
			done();
		});

	});

});
