'use strict';

angular.module('rioxApp')
.controller('OperationsCtrl', function ($scope, $state, $stateParams) {

	$scope.$watch("sources", function(sources) {
		if(!sources) return;
		$scope.loadSourceDetails(sources, $stateParams.sourceId);
	});

	$scope.addOperation = function() {
		var copy = $scope.prepareApiObj($scope.shared.selectedAPI);
		var newOp = {};
		newOp[NAME] = "New Operation";
		newOp[HTTP_METHOD] = "GET";
		newOp[HTTP_RESOURCE] = "/new";
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
	$scope.setNavPath($scope, $state);

});
