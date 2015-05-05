'use strict';

angular.module('rioxApp')
.controller('StreamsProvidedCtrl', function ($scope, Auth, $location, $window, $stateParams) {

	$scope.trim = window.trim;
	$scope.selectedStream = null;
	$scope.consumers = null;

	/* load streams */
	var loadStreams = function() {
		riox.streams.provided({}, function(streams) {
			$scope.$apply(function() {
				$scope.streams = streams;
				$scope.prepareStreamSources($scope.streams);
				$.each(streams, function(idx,el) {
					loadStreamConsumers(el);
				});
			});
		});
	};

	/* load stream details */
	var loadStreamDetails = function() {
		var id = $stateParams.streamId;
		if(!id) return;
		riox.streams.source(id, function(stream) {
			$scope.$apply(function() {
				$scope.selectedStream = stream;
				$scope.prepareStreamSource(stream);
				loadStreamConsumers(stream);
			});
		});
	}
	var loadStreamConsumers = function(stream) {
		if(stream.consumers) return;
		riox.access({streamId: stream.id}, function(accesses) {
			$scope.$apply(function() {
				stream.consumers = accesses;
			});
		});
	}

	/* load main elements */
	loadStreams();
	loadStreamDetails();

});
