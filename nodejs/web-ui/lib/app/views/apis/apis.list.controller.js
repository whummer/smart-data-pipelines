'use strict';

angular.module('rioxApp')
.controller('ApisEndpointsCtrl', function ($scope, $state, $rootScope, ngTableParams) {

	$scope.trim = window.trim;

	var loadTableParams = function() {
		var data = $scope.sources;
		$scope.tableParams = new ngTableParams({
			page: 1,
			count: 10
	    }, {
	        total: data.length,
	        getData: function ($defer, params) {
	        	var from = (params.page() - 1) * params.count();
	        	var to = params.page() * params.count();
	            $defer.resolve(data.slice(from, to));
	        }
	    });
	};

	/* get nav. bar stack */
	$scope.getNavPart = function() {
		return false;
	};
	$scope.setNavPath($scope, $state);

	/* load main elements */
	$scope.loadStreamSources().
		then($scope.prepareStreamSources).
		then($scope.loadStreamsConsumers).
		then($scope.loadSourceDetails).
		then(loadTableParams);

});
