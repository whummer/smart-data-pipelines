(function () {
	/*globals it:false, before:false, after:false*/
	'use strict';

	var logger = require("../../lib/logging"); // require('winston');
	var expect = require('chai').expect;

	module.exports = function (Driver, url) {
		var red;

		before(function () {
			red = new Driver(url);
		});

		after(function () {
			red.destructor();
		});

		it('Domain with no match, no fallback', function (done) {
			red.read('unmatched.com', "get", "/not/available")			
				.catch(function (err) {
					//logger.error(err);
					expect(err).to.eql("Host 'unmatched.com', method 'get' or path '/not/available' not defined.");
					done();
				});
		});

		// it('Single domain with a backend', function (done) {
		// 	red.create('domain.com', 'myvhost', function () {
		// 		red.add('domain.com', 'backend:1234', function () {
		// 			red.read(['domain.com', '*'], function (err, data) {
		// 				expect(data).to.eql([
		// 					['myvhost', 'backend:1234'],
		// 					[],
		// 					[]
		// 				]);
		// 				done();
		// 			});
		// 		});
		// 	});
		// });

		// it('Single domain with multiple backends', function (done) {
		// 	red.add('domain.com', 'backend:4567', function () {
		// 		red.read(['domain.com', '*'], function (err, data) {
		// 			expect(data).to.eql([
		// 				['myvhost', 'backend:1234', 'backend:4567'],
		// 				[],
		// 				[]
		// 			]);
		// 			done();
		// 		});
		// 	});
		// });

		// it('Single domain with multiple backends and fallback', function (done) {
		// 	red.create('*', 'supervhost', function () {
		// 		red.add('*', 'backend:910', function () {
		// 			red.read(['domain.com', '*'], function (err, data) {
		// 				expect(data).to.eql([
		// 					['myvhost', 'backend:1234', 'backend:4567'],
		// 					['supervhost', 'backend:910'],
		// 					[]
		// 				]);
		// 				done();
		// 			});
		// 		});
		// 	});
		// });

		// it('Single domain with multiple backends and fallback plus dead', function (done) {
		// 	red.mark('domain.com', 1, 'backend:4567', 2, 1, function () {
		// 		red.read(['domain.com', '*'], function (err, data) {
		// 			expect(data).to.eql([
		// 				['myvhost', 'backend:1234', 'backend:4567'],
		// 				['supervhost', 'backend:910'],
		// 				[1]
		// 			]);
		// 			done();
		// 		});
		// 	});
		// });

		// it('Single domain with multiple backends and fallback plus a second dead', function (done) {
		// 	red.mark('domain.com', 5, 'backend:4567', 2, 1, function () {
		// 		red.read(['domain.com', '*'], function (err, data) {
		// 			expect(data).to.eql([
		// 				['myvhost', 'backend:1234', 'backend:4567'],
		// 				['supervhost', 'backend:910'],
		// 				[1, 5]
		// 			]);
		// 			done();
		// 		});
		// 	});
		// });

  //       it('Routes for backend', function (done) {           
	 //        red.createRoute("bmw.riox.io", "GET", { "/api/v1/users" : "/users" }, function (err, data) {
	 //            red.getRoute("bmw.riox.io", "get", "/api/v1/users", function (err, data) {
	 //                logger.debug("Route data: ", data);
	 //                expect(data).to.eql('/users');
	 //                done();
	 //            });
	 //        });           
  //       });

	
						it('Create routes for backend', function (done) {
								red = new Driver(['redis://:7001']);

								red.once('ready', function (e) {
										expect(red.connected).to.eql(true);

										var getRouteMap = {
												"/api/v0/users" : "user-service:/users",
												"/api/v0/me/*" : "user-service:/me",

										};
										var postRouteMap = {
												"/api/v0/users" : "user-service:/users",
										}

										var vhost = "bmw.riox.io";
										var bmwUserServiceBackends = [ 
												"http://my-org-service1:3000", 
												"http://my-org-service2:3000" 
										];

										red.create(vhost, "user-service", bmwUserServiceBackends[0])
											 .then(red.create(vhost, "user-service", bmwUserServiceBackends[1]))
											 .then(red.add(vhost, "GET", getRouteMap))
											 .then(red.add(vhost, "POST", postRouteMap))
											 .then(function () {
														return red.read(vhost, "GET", "/api/v0/users")
												})
											 .then(function (result) {
														logger.debug("result: ", result);
														expect(result).to.eql( {
																backends : [ 'http://my-org-service1:3000', 'http://my-org-service2:3000'], 
																service : 'user-service', 
																dead : [], 
																targetPath : '/users',                                
														});

														done();
											 }).catch (function (err) {
														logger.error(err);
														done(err);
											 });
								});

								red.once('error', function (e) {
										// We are down
										expect(e.name).to.eql('DriverError');
										expect(e.category).to.eql(DriverError.UNSPECIFIED);
										red.destructor();
										done();
								});

						});


		// it('... let it expire', function (done) {
		// 	// Now, let it expire
		// 	setTimeout(function () {
		// 		red.read(['domain.com', '*'], function (err, data) {
		// 			expect(data).to.eql([
		// 				['myvhost', 'backend:1234', 'backend:4567'],
		// 				['supervhost', 'backend:910'],
		// 				[]
		// 			]);
		// 			done();
		// 		});
		// 	}, 1500);
		// });

	};

})();
