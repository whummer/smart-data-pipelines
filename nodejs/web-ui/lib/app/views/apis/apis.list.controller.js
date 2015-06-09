'use strict';

angular.module('rioxApp')
.controller('ApisEndpointsCtrl', function ($scope, Auth) {

	$scope.trim = window.trim;

	$scope.getNavPath = function() {
		var path = [
			{ sref: "index.apis.endpoints", name: "APIs" }
		];
		$scope.shared.navigationPath = path;
		return path;
	};

	/* load main elements */
	$scope.loadStreamSources().
		then($scope.prepareStreamSources).
		then($scope.loadStreamsConsumers).
		then($scope.loadSourceDetails);

	$scope.getNavPath();
});
