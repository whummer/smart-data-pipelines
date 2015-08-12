'use strict';

var log = global.log || require('winston');
var should = require('chai').should();


describe("source::http-poll", function() {

	it('start polling example.com at 5 seconds intervals', function(done) {
		var args = {
			dryrun: true,
			options: {
				interval : 5,
				url : "http://example.com",
				'http-method' : "GET"
			},
			next_id: "myid"
		};

		var modulz = require('../../api/pipes/deployments/mapping/springxd/source/http-poll');
		modulz(args,
			function success(message) {
				message.should.equal("trigger --fixedDelay=5 | http-client "
																	+ "--url='''http://example.com''' "
																	+ "--httpMethod=GET > queue:myid")
				done();
			},
			function error() {
				should.fail();
				done();
			}
		)
	});
});
