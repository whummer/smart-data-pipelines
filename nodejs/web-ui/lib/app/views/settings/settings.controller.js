'use strict';

angular.module('rioxApp')
.controller('SettingsCtrl', function ($scope, $state) {

	/* get nav. bar stack */
	$scope.getNavPart = function() {
		return { sref: "index.settings", name: "Settings" };
	}
	$scope.setNavPath($scope, $state);

});
