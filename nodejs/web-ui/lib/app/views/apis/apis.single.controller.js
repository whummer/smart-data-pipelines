'use strict';

angular.module('rioxApp')
.controller('ApisEndpointsSingleCtrl', function ($scope, Auth, $stateParams) {

	$scope.$watch("sources", function(sources) {
		if(!sources) return;
		// console.log("sources", sources);
		$scope.loadSourceDetails(sources, $stateParams.sourceId);
		$scope.setNavPath($scope);
	});


	/* get nav. bar stack */
	$scope.getNavPart = function() {
		if($scope.shared.selectedAPI) {
			return { name: "API '" + $scope.shared.selectedAPI.name + "'", sref: false};
		}
	}
	$scope.setNavPath($scope);

});
