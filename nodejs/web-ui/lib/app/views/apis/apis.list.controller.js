'use strict';

angular.module('rioxApp')
.controller('ApisEndpointsCtrl', function ($scope, $state, $rootScope) {

	$scope.trim = window.trim;

	/* get nav. bar stack */
	$scope.getNavPart = function() {
		return false;
	};
	$scope.setNavPath($scope, $state);

	/* load main elements */
	$scope.loadStreamSources().
		then($scope.prepareStreamSources).
		then($scope.loadStreamsConsumers).
		then($scope.loadSourceDetails);

});
