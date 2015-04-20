function pricingCtrl($scope, $log, $http, growl, $state) {
	$log.debug("Inside pricingCtrl");

	$scope.pricingSliderOptions = {
		values: [
			"0.0001 Cent", "0.001 Cent", "0.01 Cent", "0.1 Cent", "1 Cent", "10 Cents"
		],
		type: 'single',
		hasGrid: true
	};
}

angular.module('rioxApp').controller('pricingCtrl', pricingCtrl);