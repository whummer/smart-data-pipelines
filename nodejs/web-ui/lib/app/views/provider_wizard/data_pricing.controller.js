function pricingCtrl($scope, $log, $http, growl, $state) {
	$log.debug("Inside pricingCtrl");

	$scope.pricingSliderOptions = {
		values: [
			"0.0001 Cent", "0.001 Cent", "0.01 Cent", "0.1 Cent", "1 Cent", "10 Cents"
		],
		type: 'single',
		hasGrid: true,
		onChange: updatePricing
	};

	function updatePricing(slider) {
		var values = ["0.0001", "0.001", "0.01", "0.1", "1", "10"];
		var value = values[slider.from];
		var id = slider.input.attr('id');
		$log.debug("Updating price slider to new value '" + value + "': " , id);
		angular.forEach($scope.resourceData.dataItems, function(item) {
			if (item.name == id) {
				item.price = value;
			}
		});
	}
}

angular.module('rioxApp').controller('pricingCtrl', pricingCtrl);