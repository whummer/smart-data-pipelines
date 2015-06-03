'use strict';

angular.module('rioxApp')
.controller('StreamsProvidedCtrl', function ($scope, Auth) {

	$scope.trim = window.trim;

	/* load main elements */
	$scope.loadStreamSources().
		then($scope.prepareStreamSources).
		then($scope.loadStreamsConsumers).
		then($scope.loadSourceDetails);

});
