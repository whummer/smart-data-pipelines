'use strict';

angular.module('rioxApp')
.controller('StreamsProvidedSingleCtrl', function ($scope, Auth, $stateParams) {

	$scope.$watch("sources", function(sources) {
		if(!sources) return;
		$scope.loadSourceDetails(sources, $stateParams.sourceId);
	});

});
