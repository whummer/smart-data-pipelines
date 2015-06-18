'use strict';

angular.module('rioxApp')
.controller('OperationsSingleCtrl', function ($scope, $state, $stateParams, growl) {

	$scope.$watch("shared.selectedAPI", function() {
		$scope.loadSelectedOperation($stateParams.operationId);
	});

	$scope.$watch("selectedOperation", function() {
		var op = $scope.selectedOperation;
		if(!op) return;
		$scope.diffPath = !!op[MAPPED_PATH];
	});

	$scope.saveDetails = function() {
		var copy = $scope.prepareApiObj($scope.shared.selectedAPI);
		riox.save.streams.source(copy, function(saved) {
			$scope.shared.selectedAPI = saved;
			growl.info("Organization details saved.");
		});
	};

});
