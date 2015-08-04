'use strict';

angular.module('rioxApp')
.controller('OperationsCtrl', function ($scope, $state, $stateParams) {

	$scope.$watch("proxies", function(proxies) {
		if(!proxies) return;
		$scope.loadProxyDetails(proxies, $stateParams.sourceId);
	});

	$scope.addOperation = function() {
		var copy = $scope.prepareApiObj($scope.shared.selectedAPI);
		var newOp = {};
		newOp[NAME] = "New Operation";
		newOp[HTTP_METHOD] = "GET";
		newOp[URL_PATH] = "/new";
		copy[OPERATIONS].push(newOp);
		riox.save.proxy(copy, function(saved) {
			$scope.$apply(function() {
				$scope.shared.selectedAPI = saved;
			});
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
		return { sref: "index.apis.operations ", name: "Operations" };
	}
	$scope.setNavPath($scope, $state);

});
