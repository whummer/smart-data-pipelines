'use strict';

angular.module('rioxApp')
.controller('InterfaceCtrl', function ($scope, Auth, $stateParams) {

	$scope.$watch("sources", function(sources) {
		console.log("sources", sources);
		if(!sources) return;
		$scope.loadSourceDetails(sources, $stateParams.sourceId);
	});

	$scope.addItem = function() {
		console.log("add item");
		$scope.selectedSource[DATA_INTERFACES].push({});
	};

});
