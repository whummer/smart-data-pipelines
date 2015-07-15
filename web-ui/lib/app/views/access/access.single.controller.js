'use strict';

angular.module('rioxApp')
.controller('AccessSingleCtrl', function ($scope, Auth, $stateParams) {

	$scope.selectedConsumer = null;
	$scope.consumers = null;
	$scope.selectedConsumer = $stateParams.organizationId;

	$scope.$watch("sources", function(sources) {
		if(!sources) return;
		$scope.loadSourceDetails(sources, $stateParams.sourceId);
	});

});
