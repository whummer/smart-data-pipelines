'use strict';

angular.module('rioxApp').controller('StreamsCtrl', function ($scope, Auth, $stateParams) {

	$scope.prepareStreamSources = function(list) {
		angular.forEach(list, function(el) {
			$scope.prepareStreamSource(el);
		});
	};

	$scope.prepareStreamSource = function(el) {
		if(el[ORGANIZATION_ID]) {
			riox.organization(el[ORGANIZATION_ID], function(org) {
				if(org[IMAGE_DATA] && org[IMAGE_DATA][0]) {
					el.organizationImg = org[IMAGE_DATA][0].href;
				}
				el.organization = org;
			});
		}
	}

});
