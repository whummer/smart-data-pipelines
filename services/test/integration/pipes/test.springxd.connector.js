'use strict';

var should = require('chai').should();
var expect = require('chai').expect
var uuid = require('node-uuid');
var springxd = require('../../../pipes-service/api/pipes/deployments/mapping/springxd.connector')

var winston =  require('winston');
var log = new winston.Logger({
	transports: [
		new winston.transports.Console({
			handleExceptions: true,
			colorize: true,
			level: 'debug'
		})
	]
});
global.log = log;

var config = {
	springxdadmin : {
		hostname: "xd-admin." + process.env.RIOX_ENV + ".svc.cluster.local",
		port: 9393
	}
};

describe('springxd.connector', function() {

	before(function(done) {
		log.debug("before hook");
		log.debug("Ensure SpringXD is running!!!!");

		springxd.initConfig(config);

		done();
	});

	after(function(done) {
		log.debug("after hook");


		// TODO cleanup by destroying all streams

		// TODO double check all is gone

		done();
	});

	it('deploys, undeploys and deletes a stream', function(done) {
		this.timeout(25000);

		var streamName = "time-"+uuid.v4();
		var streamDefinition = "time --fixedDelay=10 | log";

		// 1. CREATE STREAM
		springxd.createStream(streamName, streamDefinition)
			.then( stream => {
				log.debug("Created stream: ", stream);
				expect(stream.status).to.equal("deployed");
				expect(stream.name).to.equal(streamName);
				return stream;
			})
			// 2. FIND STREAM
			.then( stream => {
				log.debug("Finding stream: ", stream);
				return springxd.findStream(streamName);
			})
			.then(result => {
				log.debug("Found stream: ", result);
				expect(result.status).to.equal("deployed");
				expect(result.name).to.equal(streamName);
				return result;
			})
			// 3. UNDEPLOY STREAM
			.then( result => {
				log.debug("Executing undeploy: ", result);
				return springxd.undeployStream(streamName);
			})
			.then( stream => {
				log.debug("Undeployed stream: ", stream.name);
				expect(stream.status).to.equal("undeployed");
				expect(stream.name).to.equal(streamName);
				return stream;
			})
			// 5. DELETE STREAM
			.then( stream => {
				log.debug("Deleting stream: ", stream.name);
				return springxd.deleteStream(streamName);
			})
			// 6. FIND STREAM
			.then( stream => {
				log.debug("Finding stream: ", stream.name);
				return springxd.findStream(streamName)
					.catch( error => {
						expect(error['logref']).to.equal("NoSuchDefinitionException");
					});
			})
			.then( stream => {
					done();
			})
			.catch( error => {
				log.error("Error creating stream: ", error);
				should.fail();
			})
	});

	it("does not find a non-existing stream", function(done) {
		var streamName = "doesnotexist";

		springxd.findStream(streamName)
			.catch(err => {
				log.debug(err);
				expect(err['logref']).to.equal("NoSuchDefinitionException");
			})
			.done(done);
	});

	it("fails when trying to deploy a non-existing stream", function(done) {
		var streamName = "doesnotexist";

		springxd.deployStream(streamName)
			.catch(err => {
				log.debug(err);
				expect(err['logref']).to.equal("NoSuchDefinitionException");
			})
			.done(done);
	});

	it("fails when trying to undeploy a non-existing stream", function(done) {
		var streamName = "doesnotexist";

		springxd.undeployStream(streamName)
			.catch(err => {
				log.debug(err);
				expect(err['logref']).to.equal("NoSuchDefinitionException");
			})
			.done(done);
	});

	it("fails when trying to redeploy a non-existing stream", function(done) {
		var streamName = "doesnotexist";

		springxd.redeployStream(streamName, 2)
			.catch(err => {
				log.debug("Expected error: ", err);
				expect(err).to.equal("Failed to re-deploy stream '" + streamName + "'.");
			})
			.done(done);
	});
	//
	//
	// it("tries to redeploy a failed stream without success", function(done) {
	// 	this.timeout(25000);
	// 	var streamDef = "http --port=9000 | log";
	// 	var stream1 = "test-conflict-" + uuid.v4();
	// 	var stream2 = "test-conflict-" + uuid.v4();
	//
	// 	springxd.createStream(stream1, streamDef)
	// 		.then(springxd.createStream(stream2, streamDef))
	// 		// /.then()
	// 		.fail(function (err) {
	// 			log.error("Unexpected error: ", err);
	// 			// should.fail();
	// 		})
	// });


});
