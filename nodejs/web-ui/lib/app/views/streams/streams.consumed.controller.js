'use strict';

angular.module('rioxApp').controller(
'StreamConsumeCtrl', function ($scope, Auth, $stateParams) {

	$scope.trim = window.trim;
	$scope.selectedStream = null;

	/* load streams */
	riox.streams.consumed({}, function(streams) {
		$scope.$apply(function() {
			$scope.streams = streams;
			$scope.prepareStreams($scope.streams);
		});
	});

	/* load stream details */
	var loadStream = function() {
		var id = $stateParams.streamId;
		if(!id) return;
		riox.stream(id, function(stream) {
			$scope.$apply(function() {
				$scope.selectedStream = stream;
				$scope.prepareStream(stream);
			});
		});
	}
	
	/* load main elements */
	loadStream();
	
});
