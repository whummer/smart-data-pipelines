'use strict';

angular.module('rioxApp')
.controller('ApisEndpointsSingleCtrl', function ($scope, growl, $stateParams) {

	$scope.$watch("sources", function(sources) {
		if(!sources) return;
		// console.log("sources", sources);
		$scope.loadSourceDetails(sources, $stateParams.sourceId);
		$scope.setNavPath($scope);
	});

	$scope.saveChanges = function() {
		var api = $scope.shared.selectedAPI;
		if(!api) return;
		riox.save.streams.source(api, function(source) {
			$scope.shared.selectedAPI = source;
			growl.info("API details saved successfully.");
		});
	};

	/* get nav. bar stack */
	$scope.getNavPart = function() {
		if($scope.shared.selectedAPI) {
			return { name: "API '" + $scope.shared.selectedAPI.name + "'", sref: false};
		}
	}
	$scope.setNavPath($scope);

	/* register event listeners */
	$scope.$watch("shared.selectedAPI[ORGANIZATION_ID]", function() {
		if(!$scope.shared.selectedAPI) return;
		var orgs = $scope.userOrganizations;
		var api = $scope.shared.selectedAPI;
		for(var i = 0; i < orgs.length; i ++) {
			if(orgs[i][ID] == api[ORGANIZATION_ID]) {
				$scope.subdomain = "." + orgs[i][DOMAIN_NAME] + ".riox.io";
				return;
			}
		}
		$scope.subdomain = ".riox.io";
	});

	/* load main elements */
	$scope.userOrganizations = $scope.getCurrentUser().organizations;

});
