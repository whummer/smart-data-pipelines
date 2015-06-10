'use strict';

angular.module('rioxApp')
.controller('ApisEndpointsSingleCtrl', function ($scope, Auth, $stateParams) {

	$scope.$watch("sources", function(sources) {
		if(!sources) return;
		// console.log("sources", sources);
		$scope.loadSourceDetails(sources, $stateParams.sourceId);
		$scope.getNavPath();
	});

	$scope.getNavPath = function() {
		var path = $scope.$parent.getNavPath();
		if($scope.shared.selectedAPI) {
			path.push(
				{ name: "API '" + $scope.shared.selectedAPI.name + "'", sref: false}
			);
		}
		$scope.shared.navigationPath = path;
		return path;
	};

	$scope.getNavPath();

});
