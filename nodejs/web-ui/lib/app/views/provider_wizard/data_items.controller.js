function dataItemsExtractorCtrl($scope, $log, $http, growl, $state) {
	$log.debug("Inside dataItemsExtractorCtrl");

	$scope.extractDataItems = function() {
		var payloadObject = angular.fromJson($scope.resourceData.payload);
		$log.debug("Got payload data: ", payloadObject);
		$scope.resourceData.extractedItems = payloadObject;
	}

	$scope.resetDataItems = function() {
		$scope.resourceData.payload = null;
		$scope.resourceData.dataItems = [];
		$scope.extractedItems = null;
	}

	$scope.pricingSliderOptions = {
		values: [
			"1 Cent", "1 Euro",
		],
		type: 'single',
		hasGrid: true
	};
}


angular.module('rioxApp').controller('dataItemsExtractorCtrl', dataItemsExtractorCtrl);