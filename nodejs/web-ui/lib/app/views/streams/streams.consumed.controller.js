'use strict';

angular.module('rioxApp').controller(
		'StreamConsumeCtrl', function ($scope, Auth, $location, $window) {

	/* load streams */
	riox.streams.consumed({}, function(streams) {
		$scope.$apply(function() {
			$scope.streams = streams;
		});
	});

});
