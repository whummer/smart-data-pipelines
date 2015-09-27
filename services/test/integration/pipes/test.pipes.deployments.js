'use strict';

var fs = require('fs');
var express = require('express');
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
	var recorder = record('test.pipes.deployments', { 'fixtures': __dirname + '/fixtures' });

	var resources = {};

	/* return true if this is a local test run which 
	 * does not execute in docker/kubernetes */
	function isLocalNonKubernetesRun() {
		/* in a kubernetes pod, some special environment
		 * variables are set which we assume are not
		 * present in local development. */
		return !process.env.KUBERNETES_PORT
	}

	function startMockServer() {

		/* create express server */
		var app = express();
		app.get('/wartezeiten/passservice/wartezeiten.svc/GetWartezeiten', function (req, res) {
			var result = {"IsOpen":false,"MBA10":0,"MBA11":0,"MBA12":0,"MBA13_14":0,"MBA15":0,"MBA16":0,"MBA17":0,"MBA18":0,"MBA19":0,"MBA1_8":0,"MBA2":0,"MBA20":0,"MBA21":0,"MBA22":0,"MBA23":0,"MBA3":0,"MBA4_5":0,"MBA6_7":0,"MBA9":0,"Timestamp":"14:43","Wartekreis":0};
			console.log("INFO: mock service result: passservice");
			res.json(result);
		});
		app.get('/wartezeiten/parkpickerl/wartezeiten.svc/GetWartezeiten', function (req, res) {
			var result = {"IsOpen":false,"MBA10":0,"MBA11":0,"MBA12":0,"MBA13_14":0,"MBA15":0,"MBA16":0,"MBA17":0,"MBA18":0,"MBA19":0,"MBA1_8":0,"MBA2":0,"MBA20":0,"MBA21":0,"MBA22":0,"MBA23":0,"MBA3":0,"MBA4_5":0,"MBA6_7":0,"MBA9":0,"Timestamp":"14:46","Wartekreis":0};
			console.log("INFO: mock service result: parkpickerl");
			res.json(result);
		});
		app.get('/wartezeiten/meldeservice/wartezeiten.svc/GetWartezeiten', function (req, res) {
			var result = {"IsOpen":false,"MBA10":0,"MBA11":0,"MBA12":0,"MBA13_14":0,"MBA15":0,"MBA16":0,"MBA17":0,"MBA18":0,"MBA19":0,"MBA1_8":0,"MBA2":0,"MBA20":0,"MBA21":0,"MBA22":0,"MBA23":0,"MBA3":0,"MBA4_5":0,"MBA6_7":0,"MBA9":0,"Timestamp":"14:46","Wartekreis":0};
			console.log("INFO: mock service result: meldeservice");
			res.json(result);
		});
		/* start server async. Should be up and running when we need it later. */
		console.log("INFO: starting server on port 6789");
		resources.server = app.listen(6789);
	}

	before(function(done) {
		log.debug('before hook');
		// recorder.before();

		startMockServer();

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
		resources.server.close();
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
		this.timeout(2*60*1000); /* this test suite may take quite a long time */

		var content = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../pipes-service/examples') + '/ma-vienna-pipe.js'));
		content = JSON.parse(JSON.stringify(content).replace(
				/www\.wien\.gv\.at/g,
				'integration-tests.test.svc.cluster.local:6789'));
		if(isLocalNonKubernetesRun()) {
			content = JSON.parse(JSON.stringify(content).replace(
					/integration-tests\.test\.svc\.cluster\.local:6789/g,
					'172.17.42.1:6789'));
		}

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

					expect(content.id).to.exist;

					var locationHeader = res.get("location");

					test.user1
						.get(locationHeader)
						.send()
						.end(function(err, res) {

							log.debug("Response: ", res.body);
							expect(res.body[PIPE_ID]).to.equal(payload[PIPE_ID])

							// check deployment status for each element
							Promise.each(res.body[STATUS], function(element) {
								expect(element.status).to.equal("deployed");
								expect(element.id).to.exist;
							})
							.then( function() {
								// query elasticsearch and ensure stuff from the pipeline made it there
								let url = "http://elasticsearch."+ process.env.RIOX_ENV +".svc.cluster.local:9200/smartcity/waitingtimes/_search?q=shortName:MBA3"
								superagent.get(url).send().end(function(err, res) {
									log.debug("Elasticsearch response: ", res.body);
									expect(res.body.hits).to.exist;
									expect(res.body.hits.total).to.be.above(0);
									Promise.each(res.body.hits.hits, function(element) {
										// log.debug("Element: ", JSON.stringify(element));
										expect(element._source.waitingTime).to.be.above(-1);
										expect(element._source.location).to.exist;
										expect(element._source.shortName).to.exist;
										expect(element._source.IsOpen).to.exist;
										expect(element._source.timestamp).to.exist;
										expect(element._source.NAME).to.exist;
									})
									.then( function() {
										test.user1
											.delete(locationHeader)
											.send()
											.end(function(err, res) {
												log.debug("Response: ", res.body);
												if (err) {
													log.error("Error: ", err);
												}
												res.status.should.equal(200);
												// TODO ensure streams are really gone
												done();
											});
									});
							});
					});
				});
			});
		});
	});

});
