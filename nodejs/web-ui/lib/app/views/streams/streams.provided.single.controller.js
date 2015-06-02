'use strict';

angular.module('rioxApp')
.controller('StreamsProvidedSingleCtrl', function ($scope, Auth, $location, $window, $stateParams, $state, $q, growl) {

	$scope.$watch("sources", function(sources) {
		if(!sources) return;
		console.log("load", $stateParams.sourceId);
		$scope.loadSourceDetails(sources, $stateParams.sourceId);
	})
});
