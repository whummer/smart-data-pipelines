'use strict';

var log = global.log || require('winston');
var should = require('chai').should();

global.config = {
	elasticsearch : {
		hostname: 'elasticsearch.development.svc.cluster.local',
		port: 9300
	}
};


describe('source::map', function() {

	it('generates a custom script tag', function(done) {
		var args = {};
		args["dryrun"] = true;
		args[ID] = "thisID";
		args[PARAMS] = {
				index : 'myunitest',
				type : 'smartcity'
		};
		args["previous_id"] = 'source';
		args["next_id"] = 'target';

		var modulz = require('../../../../../../api/pipes/deployments/springxd/mapping/sink/map');
		modulz(null, args).then(stream => {
			stream.should.equal(
					'queue:source > elasticsearch --mode=transport '
					+'--guessSchemas=true --addTimestamp=true '
					+'--clusterName=elasticsearch '
					+'--hosts=elasticsearch.development.svc.cluster.local:9300 '
					+'--index=myunitest --type=smartcity');
			done();
		})
		.catch( err => {
			log.error(err);
			should.fail();
		});
	});
});
