'use strict';

angular.module('rioxApp').controller('StreamsCtrl', function ($scope, Auth, $stateParams, $q) {

	$scope.prepareStreamSources = function(list) {
		var promise = $q.when(1);
		angular.forEach(list, function(el) {
			promise = promise.then(function() {
				return $q(function(resolve, reject) {
					$scope.prepareStreamSource(el, resolve);
				});
			});
		});
		return promise;
	};

	$scope.prepareStreamSource = function(el, callback) {
		if(el[ORGANIZATION_ID]) {
			riox.organization(el[ORGANIZATION_ID], function(org) {
				if(org[IMAGE_DATA] && org[IMAGE_DATA][0]) {
					el.organizationImg = org[IMAGE_DATA][0].href;
				}
				el.organization = org;
				if(callback) callback();
			});
		} else {
			if(callback) callback();
		}
	}

});
