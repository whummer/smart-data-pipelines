angular.module('rioxApp').controller('ListBricksCtrl', function ($scope, $state, $location, $log) {
	$log.debug('Inside BrickListCtrl');

	/* get nav. bar stack */
	$scope.getNavPart = function() {
		return { sref: "index.help.databricks", name: "Help" };
	};
	$scope.setNavPath($scope, $state);

});
