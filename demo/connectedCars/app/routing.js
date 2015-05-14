'use strict';

angular.module('rioxApp').config(function($stateProvider, $urlRouterProvider) {

	$urlRouterProvider.otherwise("/home");

	$stateProvider

	/* index */
	.state('main', {
		templateUrl : "app/views/main/main.html"
	})
	/* home */
	.state('main.home', {
		url: "/home",
		templateUrl : "app/views/home/home.html"
	})
	/* driver */
	.state('main.driver', {
		url: "/driver",
		controller: "DriverCtrl",
		templateUrl : "app/views/driver/driver.html"
	})
	/* data consumer */
	.state('main.consumer', {
		url: "/consumer",
		controller: "ConsumerCtrl",
		templateUrl : "app/views/consumer/consumer.html"
	});

});
