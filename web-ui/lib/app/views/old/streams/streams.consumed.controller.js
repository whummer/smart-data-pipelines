'use strict';

angular.module('rioxApp').controller('StreamsConsumedCtrl', function ($scope, Auth, $stateParams, Formatter) {

	$scope.trim = window.trim;
	$scope.selectedSource = null;
	$scope.format = Formatter;

	/* load streams */
	riox.streams.consumed({}, function(streams) {
		$scope.$apply(function() {
			$scope.streams = streams;
			$scope.prepareStreamSources($scope.streams);
		});
	});

	/* load stream details */
	var loadStream = function() {
		var id = $stateParams.sourceId;
		if(!id) return;
		riox.streams.source(id, function(source) {
			$scope.$apply(function() {
				$scope.selectedSource = source;
				$scope.prepareStreamSource(source);
			});
		});
	};

	/* load main elements */
	loadStream();

});
