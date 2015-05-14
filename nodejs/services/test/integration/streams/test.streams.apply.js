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

describe('streams.flow', function() {

	before(function(done) {
		/* start service(s) */
		app.users = starters.startUsersService();
		app.streams = starters.startStreamsService();
		app.resourcesCreated = { xdStreams : [] };
		/* get auth token */
		test.authDefault(done);
	});
	after(function(done) {
		app.users.server.stop();
		app.resourcesCreated.xdStreams.forEach(function(resource) {
			// TODO
		});
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

		var objs = {
			stream: {name: "stream1"}
		};

		var addSource = function(resolve, reject) {
			var source = objs.source = { "name": "source1" };
			source[CONNECTOR] = {type: "http"};
			source[ORGANIZATION_ID] = test.user1.orgs.default.id;
			riox.add.streams.source(source, wrap(resolve), reject);
		};

		var addSink = function(resolve, reject) {
			var sink = objs.sink = {name: "sink1"};
			sink[CONNECTOR] = {type: "websocket"};
			sink[ORGANIZATION_ID] = test.user2.orgs.default.id;
			riox.add.streams.sink(sink, wrap(resolve), reject);
		};

		var addStream = function(resolve, reject) {
			riox.add.stream(objs.stream, wrap(resolve), reject);
		};

		var applyConfig = function(resolve, reject) {
			var req = {};
			req[STREAM_ID] = objs.stream.id;
			riox.stream.apply(req, wrap(resolve), reject);
		};

		var registerWebsocket = function(resolve, reject) {
			var url = "ws://" + config.xdcontainer.outbound.hostname + ":" + config.xdcontainer.outbound.port + "/" +
				objs.sink[ORGANIZATION_ID] + "/" + objs.sink.id;
			log.debug("subscribing to websocket ", url);
			var ws = new WebSocket(url);
			app.receivedMessages = [];

			ws.on('open', function open() {
				log.debug("ws open");
			});
			ws.on('error', function error(error) {
				log.debug("ws error: ", error);
			});
			ws.on('message', function(data, flags) {
				log.debug("msg -> ", data);
				app.receivedMessages.push(data);
			});
			resolve();
		};

		var sendMessages = function(resolve, reject) {
			var url = "http://" + config.xdcontainer.inbound.hostname + ":" + config.xdcontainer.inbound.port + "/" +
				objs.source[ORGANIZATION_ID] + "/" + objs.source.id;
			app.numMessages = 10;
			var i = 0;
			for(; i < app.numMessages; i ++) {
				log.debug("posting data item to", url);
				superagent.post(url).send({foo: i}).
				end(function(err, res) {});
			}
			resolve();
		};

		var awaitMessages = function(resolve, reject) {
			var func = function(retries) {
				if(retries < 0) {
					return reject("Did not receive all websocket messages: " + app.receivedMessages.length);
				}
				if(app.receivedMessages.length >= app.numMessages) {
					return resolve(app.receivedMessages);
				}
				setTimeout(function() {
					func(retries - 1);
				}, 1000);
			};
			func(20); // wait up to 20 seconds (sometimes takes quite long for messages to arrive)
		};

		new Promise(addSource).
		then(function(source) {
			// console.log("added source", source);
			objs.source = source;
			objs.stream[SOURCE_ID] = source.id;
			return new Promise(addSink);
		}).
		then(function(sink) {
			// console.log("added sink", sink);
			objs.sink = sink;
			objs.stream[SINK_ID] = sink.id;
			return new Promise(addStream);
		}).
		then(function(stream) {
			// console.log("got stream", stream.id);
			objs.stream = stream;
			return new Promise(applyConfig);
		}).
		then(function() {
			return new Promise(registerWebsocket);
		}).
		then(function(websocket) {
			log.debug("configured websocket");
			return new Promise(sendMessages);
		}).
		then(function(messages) {
			return new Promise(awaitMessages);
		}).
		then(function(messages) {
			done();
		},
		function(err) {
			log.debug("Error: ", err);
			done(new Error("Error in the flow:", err));
		});

	});

});
