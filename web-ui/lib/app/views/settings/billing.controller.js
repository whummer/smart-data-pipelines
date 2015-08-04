'use strict';

angular.module('rioxApp')
.controller('SettingsBillingCtrl', function ($scope, $state) {

	/* get nav. bar stack */
	$scope.getNavPart = function() {
		return { sref: "index.settings.billing", name: "Billing" };
	}
	$scope.setNavPath($scope, $state);

});
