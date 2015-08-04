'use strict';

angular.module('rioxApp')
.controller('AccessSingleCtrl', function ($scope, Auth, $stateParams) {

	$scope.selectedConsumer = null;
	$scope.consumers = null;
	$scope.selectedConsumer = $stateParams.organizationId;

	$scope.$watch("proxies", function(proxies) {
		if(!proxies) return;
		$scope.loadProxyDetails(proxies, $stateParams.sourceId);
	});

});
