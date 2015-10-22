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
		app.files = starters.startFilesService();
		app.files.url = global.servicesConfig.files.url =
			"http://integration-tests." + process.env.RIOX_ENV + 
			".svc.cluster.local:" + app.files.port + "/api/v1/files";

		// TODO promisify!
		setTimeout(function() {
			test.authDefault(done);
		}, 2000);

		/* this tells the services and bootstrap scripts not 
		 * to loop forever using setTimeout(..) etc. because 
		 * otherwise the process would never terminate. */
		global.avoidLoopingForever = true;

	});

	after(function(done) {
		log.debug('after hook - Services shut down');
		app.users.server.stop();
		if (app.pipes.server)
			app.pipes.server.stop();
		if (app.files.server)
			app.files.server.stop();

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
					//log.debug('Expected error: ', err)
					res.status.should.equal(400);
					//log.debug('Body: ', res.body);
					done();
				} else {
					should.fail("Should result in error");
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
					res.status.should.equal(400);
					done();
				} else {
					should.fail("Should result in error");
				}
			});
	});

	it ('deploys a non existing pipeline id should fail with a 404 code', function(done) {
		var payload = {}
		payload[PIPE_ID] = 'doesnotexist';

		test.user1
			.put(app.pipes.deployments.url + "/deploy")
			.send(payload)
			.end(function(err, res) {
				if (err) {
					//log.debug('Expected error: ', err)
					res.status.should.equal(404);
					//log.debug('Body: ', res.body);
					expect(res.body[ERROR_MESSAGE]).to.include(payload[PIPE_ID]);
					done();
				} else {
					should.fail("Should result in error");
				}
			});
	});

	it ('deploys a valid pipeline and its succeeds', function(done) {
		this.timeout(10*60*1000); /* this test suite may take quite a long time */

		var content = JSON.parse(fs.readFileSync(path.join(__dirname, 
				'../../../pipes-service/examples') + '/ma-vienna-pipe.js'));
		content = JSON.parse(JSON.stringify(content).replace(
				/www\.wien\.gv\.at/g,
				'integration-tests.' + process.env.RIOX_ENV + '.svc.cluster.local:6789'));

		var state = {};

		Promise.resolve()
		.then(function() {
			/* Step 1. */
			console.log("1) upload the required resources/scripts to the files service");
			return new Promise(function(resolve, reject) {
				var regexScript = __dirname + "/resources/regexReplace.groovy";
				var addjsonScript = __dirname + "/resources/json-add-element.groovy";
				var csvData = __dirname + "/resources/ma-data.csv";
				var fileServiceRef = {
						files: {
							url: "http://integration-tests." + process.env.RIOX_ENV + ".svc.cluster.local:" + app.files.port + "/api/v1/files"
						}
				};
				console.log("Uploading test files to URL:", fileServiceRef.files.url);
				test.uploadFile(fileServiceRef, test.user1, regexScript, function(result) {
					state.regexScriptFileID = result;
					console.log("state.regexScriptFileID", state.regexScriptFileID);
					test.uploadFile(fileServiceRef, test.user1, csvData, function(result) {
						state.csvDataFileID = result;
						console.log("state.csvDataFileID", state.csvDataFileID);
						test.uploadFile(fileServiceRef, test.user1, addjsonScript, function(result) {
							state.addjsonScriptFileID = result;
							console.log("state.addjsonScriptFileID", state.addjsonScriptFileID);

							/* set the file URLs in the request */
							content[PIPE_ELEMENTS].forEach(function(pipeEl) {
								if(pipeEl[TYPE] == "script") {
									if(pipeEl[PARAMS].location.indexOf("regexReplace.groovy") >= 0) {
										pipeEl[PARAMS].location = fileServiceRef.files.url + "/" + state.regexScriptFileID;
									}
									if(pipeEl[PARAMS].location.indexOf("json-add-element.groovy") >= 0) {
										pipeEl[PARAMS].location = fileServiceRef.files.url + "/" + state.addjsonScriptFileID;
									}
								} else if(pipeEl[TYPE] == "enrich") {
									if(pipeEl[PARAMS].url.indexOf("ma-data.csv") >= 0) {
										pipeEl[PARAMS].url = fileServiceRef.files.url + "/" + state.csvDataFileID;
									}
								}
							});

							resolve();
						}, reject);
					}, reject);
				}, reject);
			});
		})
		.then(function() {
			/* Step 2. */
			console.log("2) add the sample pipe and get the ID");
			return new Promise(function(resolve, reject) {
				test.user1.post(app.pipes.url).send(content).end(function(err, res) {
					if (err) {
						log.error('Unexpected error: ', err)
						should.fail();
					}
					expect(res.body.id).to.exist;

					// 2. Define the POST /deployments payload
					var payload = {}
					payload[PIPE_ID] = res.body.id;
					state.payload = payload;

					resolve();
				})
			});
		})
		.then(function() {
			/* Step 3. */
			console.log("3) send request to deploy the pipe");
			var deployURL = app.pipes.deployments.url + "/deploy";
			return new Promise(function(resolve, reject) {
				test.user1
				.put(deployURL)
				.send(state.payload)
				.end(function(err, res) {
					if (err) {
						log.error('Unexpected error: ', err);
						should.fail();
					}

					res.status.should.equal(201);
					expect(res.body).to.exist;
					let content = res.body;
					//log.debug('Body: ', JSON.stringify(content));

					expect(content.id).to.exist;
					var locationHeader = res.get("location");
					state.locationHeader = locationHeader;

					resolve();
				});
			})
		})
		.then(function() {
			/* Step 4. */
			console.log("4) check deployment status of the pipe:", state.locationHeader);
			return new Promise(function(resolve, reject) {
				test.user1
				.get(state.locationHeader)
				.send()
				.end(function(err, res) {
					if(err) {
						return reject(err);
					}
					log.debug("Response: ", res.body);
					expect(res.body[PIPE_ID]).to.equal(state.payload[PIPE_ID])

					/* check deployment status for each element */
					for(var element of res.body[PIPE_ELEMENTS]) {
						expect([STATUS_DEPLOYED, STATUS_NOT_DEPLOYABLE]).to.include(element.status);
						expect(element.id).to.exist;
					}

					resolve();
				});
			});
		})
		.then(function() {
			/* Step 5. */
			console.log("5) query elasticsearch and ensure stuff from the pipeline made it there");
			return new Promise(function(resolve, reject) {
				var indexName = test.user1.orgs.default[ID];
				let url = "http://elasticsearch."+ process.env.RIOX_ENV + 
					".svc.cluster.local:9200/" + indexName + 
					"/waitingtimes/_search?q=shortName:MBA3";
				log.info("Query ES:", url);
				var retries = 30;
				var timeout = 15*1000;
				var loop = function() {
					if(retries <= 0) {
						return reject("Cannot get data from Elasticsearch.");
					}
					superagent.get(url).send().end(function(err, res) {
						if(!err && res) {
							log.debug("Elasticsearch response:", res.body);
							expect(res.body.hits).to.exist;
							if(res.body.hits.total <= 0) {
								err = "No result arrived in Elasticsearch yet";
								log.warn(err);
							}
						}
						if(err || !res) {
							log.debug("Error in elasticsearch response. Re-trying. (" + retries + " retries left).");
							retries = retries - 1;
							return setTimeout(loop, timeout);
						}
						resolve(res.body.hits);
					});
				}
				loop();
			});
		})
		.then( function(hits) {
			/* Step 6. */
			console.log("6) check that all data are correct");
			return Promise.each(hits.hits, function(element) {
				// log.debug("Element: ", JSON.stringify(element));
				expect(element._source.waitingTime).to.be.above(-1);
				expect(element._source.location).to.exist;
				expect(element._source.shortName).to.exist;
				expect(element._source.IsOpen).to.exist;
				expect(element._source.timestamp).to.exist;
				expect(element._source.NAME).to.exist;
			});
		})
		.then( function() {
			/* Step 7. */
			console.log("7) clean-up: delete the pipe deployment");
			test.user1
			.delete(state.locationHeader)
			.send()
			.end(function(err, res) {
				log.debug("Response: ", res.body);
				if (err) {
					log.error("Error: ", err);
				}
				res.status.should.equal(200);
				// TODO ensure streams are really gone; cleanup uploaded test files in files-service
				done();
			});
		});
	});

});
