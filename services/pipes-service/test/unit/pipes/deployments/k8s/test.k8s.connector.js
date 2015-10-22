// TODO fix
//'use strict';
//
//var should = require('chai').should();
//var expect = require('chai').expect
//var nock = require('nock');
//var path = require('path');
//var fs = require('fs');
//var record = require('riox-services-base/lib/test/record');
//var Connector = require('../../../../../api/deployments/k8s/k8s.connector');
//var log = global.log || require('winston');
//
//log.level = 'debug';
//
//describe('k8s.connector', function() {
//
//	var recorder = record('k8s.connector', { 'fixtures': __dirname + '../../../../../fixtures' });
//	var k8s = new Connector();
//
//	before(function(done) {
//		recorder.before();
//		done();
//	});
//
//	after(function(done) {
//		// TODO cleanup
//		recorder.after(done);
//	});
//
//	it('deploys, undeploys and deletes a stream', function(done) {
//		this.timeout(30*1000);
//
//		var streamName = "time-test-stream";
//		var streamDefinition = "time --fixedDelay=10 | log";
//
//		var pipeEl = {};
//		pipeEl[ID] = "source123";
//		pipeEl[CATEGORY] = "source";
//		pipeEl[TYPE] = "http-in";
//		pipeEl[PARAMS] = {
//				"port": 6789
//		};
//		var containerMapping = require("../../../../../api/deployments/k8s/mapping/" +
//				pipeEl[CATEGORY] + "/" + pipeEl[TYPE])(pipeEl);
//
//		// 1. CREATE PIPE ELEMENT
//		containerMapping.then(containers => {
//			for(var cont of containers) {
//				if(!cont.pipeElement) cont.pipeElement = pipeEl;
//			}
//			return k8s.deployContainers(containers);
//		})
//		.then( containerState => {
//			log.debug("Created containers: ", containerState);
//			expect(containerState.status).to.equal("deployed");
//			return containerState;
//		})
//		// 2. FIND STREAM
//		.then( stream => {
//			log.debug("Finding stream: ", stream);
//			return k8s.findStream(streamName);
//		})
//		.then(result => {
//			log.debug("Found stream: ", result);
//			expect(result.status).to.equal("deployed");
//			expect(result.name).to.equal(streamName);
//			return result;
//		})
//		// 3. UNDEPLOY STREAM
//		.then( result => {
//			log.debug("Executing undeploy: ", result);
//			return k8s.undeployStream(streamName);
//		})
//		.then( stream => {
//			log.debug("Undeployed stream: ", stream.name);
//			expect(["undeployed", "unknown"]).to.include(stream.status);
//			expect(stream.name).to.equal(streamName);
//			return stream;
//		})
//		// 5. DELETE STREAM
//		.then( stream => {
//			log.debug("Deleting stream: ", stream.name);
//			return k8s.deleteStream(streamName);
//		})
//		// 6. FIND STREAM
//		.then( stream => {
//			log.debug("Finding stream: ", stream.name);
//			return k8s.findStream(streamName)
//				.catch( error => {
//					expect(error['logref']).to.equal("NoSuchDefinitionException");
//				});
//		})
//		.then( stream => {
//				done();
//		})
//		.catch( error => {
//			log.error("Error creating stream: ", error);
//			should.fail();
//		})
//	});
//
//	it("does not find a non-existing stream", function(done) {
//		var streamName = "doesnotexist";
//
//		k8s.findStream(streamName)
//			.catch(err => {
//				log.debug(err);
//				expect(["NoSuchDefinitionException"]).to.include(err['logref']);
//			})
//			.done(done);
//	});
//
//	it("fails when trying to deploy a non-existing stream", function(done) {
//		var streamName = "doesnotexist";
//
//		k8s.deployStream(streamName)
//			.catch(err => {
//				log.debug(err);
//				expect(["NoSuchDefinitionException"]).to.include(err['logref']);
//			})
//			.done(done);
//	});
//
//	it("fails when trying to undeploy a non-existing stream", function(done) {
//		var streamName = "doesnotexist";
//
//		k8s.undeployStream(streamName)
//			.catch(err => {
//				log.debug(err);
//				expect(["IllegalArgumentException", "NoSuchDefinitionException"]).to.include(err['logref']);
//			})
//			.done(done);
//	});
//
//	it("fails when trying to redeploy a non-existing stream", function(done) {
//		var streamName = "doesnotexist";
//
//		k8s.redeployStream(streamName, 2)
//			.catch(err => {
//				log.debug("Expected error: ", err);
//				expect(err).to.equal("Failed to re-deploy stream '" + streamName + "'.");
//			})
//			.done(done);
//	});
//
//});
