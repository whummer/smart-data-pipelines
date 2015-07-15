'use strict';

angular.module('rioxApp').controller(
'StreamsCatalogCtrl', function ($scope, Auth, $stateParams, $state) {

	$scope.producersAutocomp = {
		options : {
			html : true,
			focusOpen : true,
			valueList : [
//			{ id : 1, label : "BMW" }
			],
			source : function(request, response) {
				// TODO implement
				//console.log(request);
				response($scope.producersAutocomp.options.valueList);
			}
		}
	};

});

