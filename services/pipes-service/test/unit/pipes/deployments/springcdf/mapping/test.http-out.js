//'use strict';
//
//var log = global.log || require('winston');
//var should = require('chai').should();
//
//describe('source::http-out', function() {
//
//	it('start polling example.com at 5 seconds intervals', function(done) {
//		var args = {};
//		args["dryrun"] = true;
//		args[ID] = "thisID";
//		args[PARAMS] = {
//			interval : 5,
//			url : 'http://example.com',
//			'http-method' : 'GET'
//		};
//		args["next_id"] = 'nextID';
//
//		var modulz = require('../../../../../../api/deployments/springcdf/mapping/source/http-out');
//		modulz(null, args).then( stream => {
//			stream.should.equal(
//				'time --fixedDelay=5 | http-client '
//				+ '--url=\'\'\'http://example.com\'\'\' '
//				+ '--httpMethod=GET '
//				+ '> queue:nextID');
//			done();
//		})
//		.catch( err => {
//			log.error(err);
//			should.fail();
//		});
//	});
//});
