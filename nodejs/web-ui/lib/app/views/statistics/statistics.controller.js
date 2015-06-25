'use strict';

angular.module('rioxApp')
.controller('StatsCtrl', function ($scope, $state, $stateParams, growl) {

	$scope.loadStats = function() {
		$scope.stats = {};
		var query = {};
		query.details = true;
		riox.statistics.invocations(query, function(stats) {
			console.log(stats);
			$scope.$apply(function() {
				$scope.stats = stats;
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
