//'use strict';
//
//var log = global.log || require('winston');
//var should = require('chai').should();
//
//
//describe('source::script', function() {
//
//	it('generates a custom script tag', function(done) {
//		var args = {};
//		args["dryrun"] = true;
//		args[ID] = "thisID";
//		args[PARAMS] = {
//				location : 'myscript.groovy',
//				variables : {
//					'key1' : 'value1',
//					'key2' : 'value2'
//				}
//		};
//		args["previous_id"] = 'source';
//		args["next_id"] = 'target';
//
//		var modulz = require('../../../../../../api/deployments/springcdf/mapping/processor/script');
//		modulz(null, args).then(stream => {
//			stream.should.equal('queue:source > groovy-transform --script=myscript.groovy ' + 
//					'--variables=\'key1=value1\\nkey2=value2\' > queue:target');
//			done();
//		})
//		.catch( err => {
//			log.error(err);
//			should.fail();
//		});
//	});
//});
