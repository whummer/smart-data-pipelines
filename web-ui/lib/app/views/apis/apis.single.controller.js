'use strict';

angular.module('rioxApp')
.controller('ApisEndpointsSingleCtrl', function ($scope, $state, growl, $stateParams) {

	$scope.$watch("proxies", function(proxies) {
		if(!proxies) return;
		$scope.loadProxyDetails(proxies, $stateParams.sourceId);
		$scope.setNavPath($scope, $state);
	});

	$scope.saveChanges = function() {
		var api = $scope.shared.selectedAPI;
		if(!api) return;
		riox.save.proxy(api, function(source) {
			//$scope.shared.selectedAPI = source; // TODO needed?
			growl.info("API details saved successfully.");
		});
	};

	$scope.removeEndpoint = function(i) {
		var api = $scope.shared.selectedAPI;
		if(!api) return;
		api[BACKEND_ENDPOINTS].splice(i, 1);
	};

	$scope.addEndpoint = function() {
		var api = $scope.shared.selectedAPI;
		if(!api) return;
		var text = !api[CONNECTOR][TYPE] ? "" : api[CONNECTOR][TYPE] + "://";
		api[BACKEND_ENDPOINTS].push(text);
	};

	var loadCertificates = function() {
		$scope.availableCertificates = [{id: "__default__", name: "-- Default Certificate --"}];
		riox.certificates(function(certs) {
			$scope.$apply(function() {
				$scope.availableCertificates = $scope.availableCertificates.concat(certs);
			});
		});
	};

	var isTopLevelDomain = function(host) {
		return host && host.match(/^.*\.((com)|(net)|(org)|(ftp\.sh))(:[0-9]+)?$/);
	};

	/* get nav. bar stack */
	$scope.getNavPart = function() {
		if($scope.shared.selectedAPI) {
			return { name: "Details", sref: "index.apis.list.single({sourceId: '" + $scope.shared.selectedAPI[ID] + "'})"};
		}
	};
	$scope.setNavPath($scope, $state);

	/* register event listeners */
	$scope.$watch("shared.selectedAPI[ORGANIZATION_ID]", function() {
		if(!$scope.shared.selectedAPI) return;
		var orgs = $scope.userOrganizations;
		var api = $scope.shared.selectedAPI;
		for(var i = 0; i < orgs.length; i ++) {
			if(orgs[i][ID] == api[ORGANIZATION_ID]) {
				var domains = clone(orgs[i][DOMAIN_NAME]);
				if(!domains.length) {
					domains = [ ".riox.io" ];
				}
				for(var j = 0; j < domains.length; j ++) {
					if(!isTopLevelDomain(domains[j])) {
						domains[j] = domains[j] + ".riox.io";
					}
					domains[j] = "." + domains[j];
				}
				$scope.subdomains = domains;
				$scope.selectedSubdomain = domains[0];
				return;
			}
		}
	});

	/* load main elements */
	$scope.userOrganizations = $scope.getCurrentUser().organizations;
	loadCertificates();

});
