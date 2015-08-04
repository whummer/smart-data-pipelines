'use strict';

angular.module('rioxApp')
.controller('SchemasCtrl', function ($scope, $state, $stateParams) {

	$scope.$watch("proxies", function(proxies) {
		if(!proxies) return;
		$scope.loadProxyDetails(proxies, $stateParams.sourceId);
	});

	$scope.deleteSchema = function(schema) {
		showConfirmDialog("Are you sure that you want to delete this data schema?", function() {
			var copy = $scope.prepareApiObj($scope.shared.selectedAPI);
			for(var i = 0; i < copy[SCHEMAS].length; i ++) {
				if(copy[SCHEMAS][i][ID] == schema[ID]) {
					copy[SCHEMAS].splice(i, 1);
				}
			}
			riox.save.streams.source(copy, function(saved) {
				$scope.$apply(function() {
					$scope.shared.selectedAPI = saved;
				});
			});
		});
	};

	$scope.addSchema = function() {
		var copy = $scope.prepareApiObj($scope.shared.selectedAPI);
		copy[SCHEMAS].push(
				{
					name: "New Data Schema"
				}
		);
		riox.save.streams.source(copy, function(saved) {
			$scope.$apply(function() {
				$scope.shared.selectedAPI = saved;
			});
		});
	};

	$scope.loadSelectedSchema = function(interfaceID) {
		var selected = $scope.shared.selectedAPI;
		if(!selected) return;
		$scope.selectedSchema = null;
		selected[SCHEMAS].forEach(function(el) {
			if(el.id == interfaceID) {
				$scope.selectedSchema = el;
			}
		});
	};

	/* get nav. bar stack */
	$scope.getNavPart = function() {
		return { sref: "index.apis.schemas", name: "Data Schemas" };
	}
	$scope.setNavPath($scope, $state);

});
