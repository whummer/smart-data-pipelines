'use strict';

angular.module('rioxApp')
.controller('InterfacesCtrl', function ($scope, Auth, $stateParams) {

	$scope.$watch("sources", function(sources) {
		if(!sources) return;
		$scope.loadSourceDetails(sources, $stateParams.sourceId);
	});

	// TODO centralize this code
	$scope.prepareApiObj = function() {
		var copy = clone($scope.shared.selectedAPI);
		/* defaults */
		if(!copy[OPERATIONS]) copy[OPERATIONS] = [];
		if(!copy[SCHEMAS]) copy[SCHEMAS] = [];
		/* clean model */
		delete copy.organization;
		delete copy.consumers;
		return copy;
	};

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

	$scope.addSchema = function() {
		var copy = $scope.prepareApiObj($scope.shared.selectedAPI);
		copy[SCHEMAS].push(
				{
					name: "New Data Schema"
				}
		);
		riox.save.streams.source(copy, function(saved) {
			$scope.shared.selectedAPI = saved;
		});
	};

	$scope.loadSelectedOpOrSchema = function(interfaceID) {
		var selected = $scope.shared.selectedAPI;
		if(!selected) return;
		$scope.selectedSchema = null;
		$scope.selectedOperation = null;
		selected[OPERATIONS].forEach(function(el) {
			if(el.id == interfaceID) {
				$scope.selectedOperation = el;
			}
		});
		selected[SCHEMAS].forEach(function(el) {
			if(el.id == interfaceID) {
				$scope.selectedSchema = el;
			}
		});
	};

});
