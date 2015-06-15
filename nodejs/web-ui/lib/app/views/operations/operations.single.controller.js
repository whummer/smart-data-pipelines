'use strict';

angular.module('rioxApp')
.controller('OperationsSingleCtrl', function ($scope, Auth, $stateParams, growl) {

	$scope.$watch("shared.selectedAPI", function() {
		$scope.loadSelectedOperation($stateParams.operationId);
	});

	$scope.saveDetails = function() {
		var copy = $scope.prepareApiObj($scope.shared.selectedAPI);
		riox.save.streams.source(copy, function(saved) {
			$scope.shared.selectedAPI = saved;
			growl.info("Organization details saved.");
		});
	};

});
