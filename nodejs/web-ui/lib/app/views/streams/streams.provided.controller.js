'use strict';

angular.module('rioxApp')
.controller('StreamsProvidedCtrl', function ($scope, Auth, $location, $window, $stateParams) {

	$scope.trim = window.trim;
	$scope.selectedSource = null;
	$scope.consumers = null;

	/* load stream sources */
	var loadStreamSources = function() {
		riox.streams.provided({}, function(sources) {
			$scope.$apply(function() {
				$scope.sources = sources;
				$scope.prepareStreamSources(sources);
				$.each(sources, function(idx,el) {
					loadStreamConsumers(el);
				});
			});
		});
	};

	/* load stream source details */
	var loadSourceDetails = function() {
		var id = $stateParams.sourceId;
		if(!id) return;
		riox.streams.source(id, function(source) {
			$scope.$apply(function() {
				$scope.selectedSource = source;
				$scope.prepareStreamSource(source);
				loadStreamConsumers(source);
			});
		});
	}
	var loadStreamConsumers = function(source) {
		if(source.consumers) return;
		var query = {};
		query[SOURCE_ID] = source.id;
		riox.access(query, function(accesses) {
			console.log(accesses);
			$scope.$apply(function() {
				source.consumers = accesses;
			});
		});
	}

	/* load main elements */
	loadStreamSources();
	loadSourceDetails();

});
