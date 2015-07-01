
angular.module('rioxApp').controller('WizardItemsCtrl', 
		function($scope, $log, $http, growl, $state) {

	$scope.extractDataItems = function () {
		try {
			$scope.error = null;
			var payloadObject = angular.fromJson($scope.resourceData.payload);
			$scope.resourceData.parsedPayload = angular.toJson(payloadObject, true);
			var flattened = flattenJson(payloadObject);
			$log.debug("Got flattened payload data: ", flattened);
			$scope.resourceData.extractedItems = flattened;
			//angular.element("#payloadArea").hide();
		} catch (e) {
			//$log.error("Cannot parse input: ", e);
			$scope.error = "Your input is invalid. Please provide a valid JSON or XML document.";
		}
	};

	$scope.resetDataItems = function() {
		$scope.resourceData.createDataItems = false;
		$scope.resourceData.payload = null;
		$scope.resourceData.dataItems = null;
		$scope.resourceData.extractedItems = null;
		$scope.resourceData.parsedPayload = null;
		$scope.error = false;
		//angular.element("#payloadArea").show();
	};

});


