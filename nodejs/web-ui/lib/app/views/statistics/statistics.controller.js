'use strict';

angular.module('rioxApp')
.controller('StatsCtrl', function ($scope, $state, growl, ngTableParams) {

	var loadTableParams = function() {
		var data = $scope.stats.details;
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

	$scope.loadStats = function() {
		$scope.stats = {};
		var query = {};
		query.details = true;
		riox.statistics.invocations(query, function(stats) {
			console.log(stats);
			$scope.$apply(function() {
				$scope.stats = stats;
				loadTableParams();
			});
		});
	};

	/* get nav. bar stack */
	$scope.getNavPart = function() {
		return { sref: "index.statistics", name: "Statistics" };
	}
	$scope.setNavPath($scope, $state);

	/* load main elements */
	$scope.loadStats();

});
