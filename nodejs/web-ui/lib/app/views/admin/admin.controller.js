'use strict';

angular.module('rioxApp')
.controller('AdminCtrl', function ($scope, $state, $stateParams) {

	/* get nav. bar stack */
	$scope.getNavPart = function() {
		return { sref: "index.admin", name: "Admin" };
	}
	$scope.setNavPath($scope, $state);

});
