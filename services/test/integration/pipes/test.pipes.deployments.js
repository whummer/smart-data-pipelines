'use strict';

var fs = require('fs');
var path = require('path');
var assert = require('assert');
var log = global.log || require('winston');
var superagent = require('superagent');
var status = require('http-status');
var should = require('chai').should();
var expect = require('chai').expect;
var test = require('../util/testutil');
var starters = require('../util/service.starters');
var record = require('riox-services-base/lib/test/record');
var Promise = require('bluebird');

var app = {};

describe('pipes.deployment', function() {

	// TODO fix this
	// var recorder = record('test.pipes.deployments', { 'fixtures': __dirname + '/fixtures' });

	before(function(done) {
		log.debug('before hook');
		// recorder.before();

		/* start service(s) */
		app.users = starters.startUsersService();
		app.pipes = starters.startPipesService();
		test.authDefault(done);

	});

	after(function(done) {
		log.debug('after hook');
		log.debug('Users service shut down');
		app.users.server.stop();
		log.debug('Pipes service shut down');
		if (app.pipes.server)
			app.pipes.server.stop();

		// recorder.after(done);
		done();
	});

	it ('deploys bogus (non-json) request should fail with a 400 code', function(done) {
		var payload = ''
		test.user1
			.post(app.pipes.deployments.url)
			.send(payload)
			.end(function(err, res) {
				if (err) {
					log.debug('Expected error: ', err)
					res.status.should.equal(400);
					log.debug('Body: ', res.body);
					done();
				}
			});
	});

	it ('deploys empty request should fail with a 400 code', function(done) {
		var payload = 'this-is-not-valid-json'
		test.user1
			.post(app.pipes.deployments.url)
			.send(payload)
			.end(function(err, res) {
				if (err) {
					log.debug('Expected error: ', err)
					res.status.should.equal(400);
					log.debug('Body: ', res.body);
					done();
				}
			});
	});

	it ('deploys a non existing pipeline id should fail with a 404 code', function(done) {
		var payload = {}
		payload[PIPE_ID] = 'doesnotexist';

		test.user1
			.post(app.pipes.deployments.url)
			.send(payload)
			.end(function(err, res) {
				if (err) {
					log.debug('Expected error: ', err)
					res.status.should.equal(404);
					log.debug('Body: ', res.body);
					expect(res.body[ERROR_MESSAGE]).to.equal('Pipe with id \'doesnotexist\' not found.');
					done();
				}
			});
	});

	it ('deploys a valid pipeline and its succeeds', function(done) {
		this.timeout(75000);

		var content = JSON.parse(fs.readFileSync(path.join(__dirname, './resources') + '/ma-pipe.json'));

		// 1. Add a sample pipe and get the ID
		test.user1.post(app.pipes.url).send(content).end(function(err, res) {
			if (err) {
				log.error('Unexpected error: ', err)
				should.fail();
			}
			expect(res.body.id).to.exist;

			// 2. Define the POST /deployments payload
			var payload = {}
			payload[PIPE_ID] = res.body.id,

			test.user1
				.post(app.pipes.deployments.url)
				.send(payload)
				.end(function(err, res) {
					if (err) {
						log.error('Unexpected error: ', err);
						should.fail();
					}

					res.status.should.equal(201);
					expect(res.body).to.exist;
					let content = res.body;
					log.debug('Body: ', JSON.stringify(content));

					Promise.each(content, function(element) {
						expect(element.status).to.equal("deployed");
					})
					.then( function(){ done() } );

				});
		});


	});

});
