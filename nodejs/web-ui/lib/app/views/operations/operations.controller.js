'use strict';

angular.module('rioxApp')
.controller('OperationsCtrl', function ($scope, Auth, $stateParams) {

	$scope.$watch("sources", function(sources) {
		if(!sources) return;
		$scope.loadSourceDetails(sources, $stateParams.sourceId);
	});

	$scope.addOperation = function() {
		var copy = $scope.prepareApiObj($scope.shared.selectedAPI);
		copy[OPERATIONS].push(
				{
					name: "New Operation",
					"http-method": "GET",
					"http-path": "/new"
				}
		);
		riox.save.streams.source(copy, function(saved) {
			$scope.shared.selectedAPI = saved;
		});
	};

	$scope.loadSelectedOperation = function(interfaceID) {
		var selected = $scope.shared.selectedAPI;
		if(!selected) return;
		$scope.selectedOperation = null;
		selected[OPERATIONS].forEach(function(el) {
			if(el.id == interfaceID) {
				$scope.selectedOperation = el;
			}
		});
	};

	/* get nav. bar stack */
	$scope.getNavPart = function() {
		return { sref: "index.notifications ", name: "Operations" };
	}
	$scope.setNavPath($scope);

});
