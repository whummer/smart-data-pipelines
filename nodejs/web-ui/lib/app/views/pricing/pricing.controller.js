'use strict';

angular.module('rioxApp')
.controller('PricingCtrl', function ($scope, $state, $stateParams) {

	$scope.$watch("sources", function(sources) {
		if(!sources) return;
		$scope.loadSourceDetails(sources, $stateParams.sourceId);
	});

	/* get nav. bar stack */
	$scope.getNavPart = function() {
		return { sref: "index.apis.pricing", name: "Pricing" };
	}
	$scope.setNavPath($scope, $state);

});
