//'use strict';
//
//var log = global.log || require('winston');
//var should = require('chai').should();
//
//global.config = {
//	elasticsearch : {
//		hostname: 'elasticsearch.development.svc.cluster.local',
//		port: 9300
//	}
//};
//
//describe('source::map', function() {
//
//	it('generates no spring module for element geo-map', function(done) {
//		var args = {};
//		args["dryrun"] = true;
//		args[ID] = "thisID";
//		args[PARAMS] = {
//				index : 'myunitest',
//				type : 'smartcity'
//		};
//		args["previous_id"] = 'source';
//		args["next_id"] = 'target';
//
//		var modulz = require('../../../../../../api/deployments/springcdf/mapping/sink/geo-map');
//		modulz(null, args).then(stream => {
//			if(stream)
//				should.fail("should be null");
//			done();
//		})
//		.catch( err => {
//			log.error(err);
//			should.fail();
//		});
//	});
//});
