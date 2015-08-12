'use strict';

var fs = require('fs');
var path = require('path');
var assert = require('assert');
var log = global.log || require('winston');
var superagent = require('superagent');
var status = require('http-status');
var test = require('../util/testutil');
var starters = require('../util/service.starters');
var riox = require('riox-shared/lib/api/riox-api');
var should = require('chai').should();

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
		if (app.pipes.server)
			app.pipes.server.stop();
		done();
	});

	it('store and retrieve a pipeline definition', function(done) {
		var content = JSON.parse(fs.readFileSync(path.join(__dirname, './resources') + "/simple-pipe.json"));

		test.user1.post(app.pipes.url).send(content).end(function(err, res) {
			if (err) {
				log.error("Unexpected error: ", err)
				should.fail();
			}

			var locationHeader = res.get("location");
			log.debug("Response status: ", res.status);
			log.debug("Response headers: ", res.headers);
			log.debug("Body: ", JSON.stringify(res.body));
			res.status.should.equal(201);
			locationHeader.should.exist;
			// res.body.id.should.exist;

			test.user2.get(res.get('location')).send().end(function(err, res) {
				if (err) {
					log.error("Unexpected error: ", err)
					should.fail();
				}
				log.debug("Response status: ", res.status);
				log.debug("Response headers: ", res.headers);
				log.debug("Body: ", JSON.stringify(res.body));
				res.body.name.should.equal("WartezeitenVisulationzPipe");
				res.body.elements.length.should.equal(4);
				res.status.should.equal(200);
				done();
			});

		});
	});

});
