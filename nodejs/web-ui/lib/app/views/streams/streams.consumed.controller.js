'use strict';

angular.module('rioxApp').controller('StreamsConsumedCtrl', function ($scope, Auth, $stateParams) {

	$scope.trim = window.trim;
	$scope.selectedStream = null;

	/* load streams */
	riox.streams.consumed({}, function(streams) {
		$scope.$apply(function() {
			$scope.streams = streams;
			$scope.prepareStreamSources($scope.streams);
		});
	});

	/* load stream details */
	var loadStream = function() {
		var id = $stateParams.streamId;
		if(!id) return;
		riox.streams.source(id, function(stream) {
			$scope.$apply(function() {
				$scope.selectedStream = stream;
				$scope.prepareStreamSource(stream);
			});
		});
	};

	/* load main elements */
	loadStream();

});
