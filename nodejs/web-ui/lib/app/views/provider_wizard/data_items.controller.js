function dataItemsExtractorCtrl($scope, $log, $http, growl, $state) {

	$scope.extractDataItems = function () {
		try {
			var payloadObject = angular.fromJson($scope.resourceData.payload);
			$scope.resourceData.parsedPayload = angular.toJson(payloadObject, true);
			var flattened = flattenJson(payloadObject);
			$log.debug("Got flattened payload data: ", flattened);
			$scope.resourceData.extractedItems = flattened;
			//angular.element("#payloadArea").hide();
		} catch (e) {
			$log.error("Cannot parse input: ", e);
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

	// http://stackoverflow.com/questions/19098797/fastest-way-to-flatten-un-flatten-nested-json-objects
	function flattenJson(data) {
		var result = {};

		function recurse(cur, prop) {
			if (Object(cur) !== cur) {
				result[prop] = cur;
			} else if (Array.isArray(cur)) {
				for (var i = 0, l = cur.length; i < l; i++)
					recurse(cur[i], prop + "[" + i + "]");
				if (l == 0)
					result[prop] = [];
			} else {
				var isEmpty = true;
				for (var p in cur) {
					isEmpty = false;
					recurse(cur[p], prop ? prop + "." + p : p);
				}
				if (isEmpty && prop)
					result[prop] = {};
			}
		}

		recurse(data, "");
		return result;
	}
}


angular.module('rioxApp').controller('dataItemsExtractorCtrl', dataItemsExtractorCtrl);