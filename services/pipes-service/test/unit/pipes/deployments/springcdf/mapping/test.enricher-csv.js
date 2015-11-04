//'use strict';
//
//var log = global.log || require('winston');
//var should = require('chai').should();
//
//
//describe('source::enrich', function() {
//
//	it('generates a custom enricher-csv tag with no cache', function(done) {
//		var args = {};
//		args["dryrun"] = true;
//		args[ID] = "thisID";
//		args[PARAMS] = {
//				'url': 'file://${script.dir}/ma-data.csv',
//				'columns': '',
//				'sourceID': 'foo',
//				'targetID': 'bar',
//				'mappings': '1:2,2:3'
//		};
//		args["previous_id"] = 'source';
//		args["next_id"] = 'target';
//
//		var modulz = require('../../../../../../api/deployments/springcdf/mapping/processor/enrich');
//		modulz(null, args).then(stream => {
//			stream.should.equal('queue:source > enricher-csv --csv.location=file://${script.dir}/ma-data.csv ' + 
//					'--csv.sourceID=foo --csv.targetID=bar --csv.mappings=\'1:2,2:3\' > queue:target');
//			done();
//		})
//		.catch( err => {
//			log.error(err);
//			should.fail();
//		});
//	});
//});
