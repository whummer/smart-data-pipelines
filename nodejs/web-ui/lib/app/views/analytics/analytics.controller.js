angular.module('rioxApp').controller('AnalyticsCtrl', function dashboardCtrl($scope, $state, $log, growl) {

	/* get nav. bar stack */
	$scope.getNavPart = function() {
		return { sref: "index.analytics", name: "Analytics" };
	};
	$scope.setNavPath($scope, $state);

});
