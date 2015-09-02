'use strict';

var log = global.log || require('winston');
var should = require('chai').should();


describe('source::enricher-csv', function() {

	it('generates a custom enricher-csv tag with no cache', function(done) {
		var args = {
			dryrun: true,
			next_id: 'target',
			previous_id: 'source',
			options: {
				'url': 'file://${script.dir}/ma-data.csv',
				'columns': '',
				'sourceID': 'foo',
				'targetID': 'bar',
				'mappings': '1:2,2:3'
			}
		};

		var modulz = require('../../../../../../api/pipes/deployments/springxd/mapping/processor/enricher-csv');
		modulz(null, args).then(stream => {
			stream.should.equal('queue:source > enricher-csv --url=file://${script.dir}/ma-data.csv --columns=\'\' --sourceID=foo --targetID=bar --mappings=\'1:2,2:3\' > queue:target');
			done();
		})
		.catch( err => {
			log.error(err);
			should.fail();
		});
	});
});
