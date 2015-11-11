'use strict';

var fs = require('fs');
var express = require('express');
var path = require('path');
var assert = require('assert');
var websocket = require('websocket');
var log = global.log || require('winston');
var superagent = require('superagent');
var status = require('http-status');
var should = require('chai').should();
var expect = require('chai').expect;
var test = require('../util/testutil');
var starters = require('../util/service.starters');
var Promise = require('bluebird');

var app = {};

describe('pipes.deploy.httpin-transform-split', function() {

	var resources = {};

	before(function(done) {
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

	});

	after(function(done) {
		log.debug('after hook - Services shut down');

		/* finish by cleaning up */
		cleanup(function() {
		 	app.users.server.stop();
		 	if (app.pipes.server)
		 		app.pipes.server.stop();
		 	if (app.files.server)
		 		app.files.server.stop();

		 	if(resources.wsConnection) {
		 		log.info('Closing Websocket connection');
		 		resources.wsConnection.close();
		 	}

		 	done();
		});
	});

	var cleanup = function(done) {
		// TODO cleanup uploaded test files in files-service
		if(resources.state.locationHeader) {
			test.user1
			.delete(resources.state.locationHeader)
			.send()
			.end(function(err, res) {
				if (err) {
					return log.error("Error: ", err);
				}
				resources.state.locationHeader = null;
				res.status.should.equal(200);
				// TODO ensure streams are really gone
				if(done) done();
			});
		} else {
			if(done) done();
		}
	}

	it ('deploys a valid pipeline and its succeeds', function(done) {
		this.timeout(5*60*1000); /* this test suite may take quite a long time */

		var content = JSON.parse(fs.readFileSync(path.join(__dirname,
				'../../../pipes-service/examples') + '/test-httpin-transform-split.js'));

		var state = resources.state = {};

		Promise.resolve()
		.then(function() {
			/* Step 1. */
			console.log("1) upload the required resources/scripts to the files service");
			return new Promise(function(resolve, reject) {
				/* currently nothing to upload in this test. Simply resolve. */
				resolve();
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
					let resContent = res.body;

					expect(resContent.id).to.exist;
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
			console.log("5) send input data and check for output data");
			return new Promise(function(resolve, reject) {
				var WebSocketClient = require('websocket').client;
				var wsClient = new WebSocketClient();
				var TEST_DATA = {data: 'test1234'};
				var NUM_MESSAGES = 100;

				var pipeElements = content[PIPE_ELEMENTS];
				var firstMessageReceived = false;
				var numMessagesSent = 0;
				var numMessagesReceived = 0;
				var doSend = null;

				/* CONNECT TO WEBSOCKET */

				var wsPipeEl = pipeElements[pipeElements.length - 1];
				var wsURL = "ws://" + wsPipeEl[ID] + "." + process.env.RIOX_ENV +
					".svc.cluster.local:" + wsPipeEl[PARAMS].port + "/";
				log.info("wsURL", wsURL);
				var subscribeRetries = 15;
				var subscribeTimeout = 10*1000;
				function loopSubscribe() {
					if(--subscribeRetries < 0) {
						return reject("Cannot subscribe to Websocket. Giving up.");
					}
					wsClient.connect(wsURL, null);
				}
				wsClient.on('connectFailed', function(error) {
					/* swallow and re-try */
					console.log("ws connectFailed: ", error);
					setTimeout(loopSubscribe, subscribeTimeout);
				});

				wsClient.on('connect', function(connection) {
					log.info('WebSocket Client Connected!');
					resources.wsConnection = connection;
					connection.on('error', function(error) {
						log.warn("Websocket Connection Error: " + error.toString());
					});
					connection.on('message', function(message) {
						if(!firstMessageReceived) {
							log.info("Received first websocket message.");
							firstMessageReceived = true;
							for(var i = 0; i < NUM_MESSAGES; i ++) {
								doSend();
							}
						} else {
							numMessagesReceived ++;
						}
						/* assert message content */
						var payload = message.utf8Data;
						expect(payload).to.include(TEST_DATA.data);

						/* finish up */
						if(numMessagesReceived == NUM_MESSAGES) {
							log.info("Successfully received all " + NUM_MESSAGES + " expected websocket messages.");
							resolve();
						}
					});
				});
				loopSubscribe();


				/* SEND TEST DATA TO HTTP-IN */

				var httpPipeEl = pipeElements[0];
				var httpURL = "http://" + httpPipeEl[ID] + "." + process.env.RIOX_ENV +
					".svc.cluster.local:" + httpPipeEl[PARAMS].port + "/messages";
				log.info("httpURL", httpURL);
				var sendRetries = 15;
				var sendTimeout = 10*1000;

				doSend = function(repeatOnError) {
					TEST_DATA['msgCount'] = numMessagesSent
					var req = superagent.post(httpURL).send(TEST_DATA).end(function(err, res) {
						if(err) {
							if(repeatOnError) {
								return loopSend();
							}
							return log.warn("Error sending data to http input: " + err);
						}
						if(firstMessageReceived) {
							numMessagesSent++;
							log.debug("numMessagesSent: ", numMessagesSent)
						} else {
							log.debug("Successfully sent data to HTTP source. Re-trying since no message has been received yet.");
							loopSend();
						}
					});
					req.on('error', function(error) {
						//log.warn("Error talking to HTTP endpoint: " + error);
						/* swallow */
					});
					return req;
				}
				var loopSend = function() {
					if(--sendRetries < 0) {
						return reject("Cannot send message to HTTP input. Giving up.");
					}
					setTimeout(function() {
						doSend(true);
					}, sendTimeout);
				}
				loopSend();

			});
		})
		.then( function() {
			/* Step 7. */
			console.log("7) clean-up: delete the pipe deployment");
			cleanup(done);
		})
		.catch( function(error) {
			log.warn("Caught error:", error);
			should.fail(error);
		});
	});

});
