function catalogCtrl($scope, $log, $http) {
	$log.debug("Inside Catalog Controller");

	// Simple GET request example :
	$http.get('/resources').
			success(function (data, status, headers, config) {
				$log.debug("Loaded " + data.length + " resources from mongo");
				$scope.dataResources = data;
			}).
			error(function (data, status, headers, config) {
				$log.error("Could not load resources from mongo. Status code: " + status + ". Additional Info: ", data)
			});
}

angular.module('rioxApp').controller(catalogCtrl);