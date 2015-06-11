'use strict';

angular.module('rioxApp')
.controller('SettingsCtrl', function ($scope, User, Auth, $window) {

	/* get nav. bar stack */
	$scope.getNavPart = function() {
		return { sref: "index.settings", name: "Settings" };
	}
	$scope.setNavPath($scope);

});
