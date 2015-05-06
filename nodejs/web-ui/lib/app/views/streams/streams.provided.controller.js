'use strict';

angular.module('rioxApp')
.controller('StreamsProvidedCtrl', function ($scope, Auth, $location, $window, $stateParams, $q) {

	$scope.trim = window.trim;
	$scope.selectedSource = null;
	$scope.selectedConsumer = null;
	$scope.consumers = null;

	/* load stream sources */
	var loadStreamSources = function() {
		var promise = $q(function(resolve, reject) {
			riox.streams.provided({}, function(sources) {
				$scope.$apply(function() {
					$scope.sources = sources;
					console.log("step 1 done.");
					resolve(sources);
				});
			});
		});
		return promise;
	};

	var prepareStreamSources = function(sources) {
		console.log("prepareStreams");
		var promise = $q(function(resolve, reject) {
			$scope.prepareStreamSources(sources).then(function() {
				console.log("step 2 done.");
				resolve(sources);
			});
		});
		return promise;
	};

	var loadConsumers = function(sources) {
		var promise = $q();
		$.each(sources, function(idx,el) {
			promise = promise.then(function(resolve, reject) {
				loadStreamConsumers(el).then(function() {
					console.log("step 3 done.", el);
					resolve();
				});
			});
		});
		return promise;
	};

	/* load stream source details */
	var loadSourceDetails = function() {
		var id = $stateParams.sourceId;
		if(!id) return;
		var deferred = $q.defer();
		var promise = deferred.promise;
		riox.streams.source(id, function(source) {
			$scope.$apply(function() {
				$scope.selectedSource = source;
				$scope.prepareStreamSource(source);
				promise = promise.then(loadStreamConsumers(source));
			});
		});
		loadSelectedConsumer();
		return promise;
	};
	var loadStreamConsumers = function(source) {
		if(source.consumers) return;
		var query = {};
		query[SOURCE_ID] = source.id;
		var deferred = $q.defer();
		riox.access(query, function(accesses) {
			$scope.$apply(function() {
				source.consumers = accesses;
			});
			deferred.resolve();
		});
		return deferred.promise;
	};

	/* load selected consumer */
	var loadSelectedConsumer = function() {
		var id = $stateParams.organizationId;
		if(!id) return;
		if(typeof $scope.selectedConsumer == "string") {
			
		}
	};

	/* load main elements */
	loadStreamSources().
		then(prepareStreamSources).
		then(loadSourceDetails).
		then(loadSelectedConsumer);
	$scope.selectedConsumer = $stateParams.organizationId;

});
