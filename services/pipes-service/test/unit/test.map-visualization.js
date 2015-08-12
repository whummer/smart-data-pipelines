'use strict';

var log = global.log || require('winston');
var should = require('chai').should();

global.config = {
	elasticsearch : {
		hostname: 'elasticsearch.development.svc.cluster.local',
		port: 9300
	}
}


describe("source::script", function() {

	it('generates a custom script tag', function(done) {
		var args = {
			dryrun: true,
			previous_id: "source",
			options: {
				index : "myunitest",
				type : "smartcity"
			}
		};

		var modulz = require('../../api/pipes/deployments/mapping/springxd/sink/map-visualization');
		modulz(args,
			function success(message) {
				message.should.equal("queue:source > elasticsearch --mode=transport "
														+"--guessSchemas=true --clusterName=elasticsearch "
														+"--hosts=elasticsearch.development.svc.cluster.local:9300 "
														+"--index=myunitest --type=smartcity");
				done();
			},
			function error() {
				should.fail();
				done();
			}
		)
	});
});
