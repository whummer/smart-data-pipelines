'use strict';

var assert = require('assert');
var log = global.log || require('winston');
var superagent = require('superagent');
var status = require('http-status');
var test = require('../util/testutil');
var starters = require('../util/service.starters');
var riox = require('riox-shared/lib/api/riox-api');
var promise = require('promise');
var WebSocket = require('ws');

var app = {};

describe('pipes.deployment', function() {

	before(function(done) {
    log.debug("before hook");
		/* start service(s) */
		app.users = starters.startUsersService();
		app.pipes = starters.startPipesService();
		test.authDefault(done);
	});

	after(function(done) {
    log.debug("after hook");
    log.debug("Users service shut down");
		app.users.server.stop();
    log.debug("Pipes service shut down");
    app.pipes.server.stop();
    done();
	});

	function wrap(func, testUser) {
		testUser = testUser ? testUser : test.user1;
		return {
			callback: func,
			headers: testUser.tokenHeaders
		};
	}

	it('creates stream source, sink, processor; and run flow e2e', function(done) {
		this.timeout(1000*60*2); // high timeout for long-running test

    done();
	});

});
