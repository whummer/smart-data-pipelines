'use strict';

angular.module('rioxApp')
.controller('SettingsBillingCtrl', function ($scope) {

	/* get nav. bar stack */
	$scope.getNavPart = function() {
		return { sref: "index.settings.billing", name: "Billing" };
	}
	$scope.setNavPath($scope);

});
