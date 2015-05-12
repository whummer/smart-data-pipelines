'use strict';

angular.module('rioxApp')
.controller('StreamsProvidedCtrl', function ($scope, Auth, $location, $window, $stateParams, $state, $q, growl) {

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
					resolve(sources);
				});
			});
		});
		return promise;
	};

	var prepareStreamSources = function(sources) {
		var promise = $q(function(resolve, reject) {
			$scope.prepareStreamSources(sources).then(function() {
				resolve(sources);
			});
		});
		return promise;
	};

	var loadConsumers = function(sources) {
		var promise = $q.when(1);
		$.each(sources, function(idx,el) {
			promise = promise.then(function() {
				return $q(function(resolve, reject) {
					loadStreamConsumers(el).then(function() {
						resolve(sources);
					});
				});
			});
		});
		return promise;
	};

	/* load stream source details */
	var loadSourceDetails = function(sources) {
		var id = $stateParams.sourceId;
		if(!id) return;
		var promise = $q(function(resolve, reject) {
			sources.forEach(function(source) {
				if(source.id == id) {
					$scope.selectedSource = source;
				}
			})
			resolve();
		});
		return promise;
	};

	/* helper methods: load stream consumers for a single source */
	
	var reloadStreamConsumers = function(source) {
		source.consumers = null;
		loadStreamConsumers(source);
	}
	var loadStreamConsumers = function(source) {
		if(source.consumers) return;
		var deferred = $q.defer();
		var query = {};
		query[SOURCE_ID] = source.id;
		riox.access(query, function(accesses) {
			source.consumers = accesses;
			var promise = $q.when(1);
			accesses.forEach(function(acc) {
				promise = promise.then(function() {
					return $q(function(resolve, reject) {
						riox.organization(acc[REQUESTOR_ID], function(org) {
							acc.requestorOrg = org;
						});
						resolve();
					});
				});
			});
			promise.then(function() {
				deferred.resolve();
			});
		});
		return deferred.promise;
	};

	/* load selected consumer */
	var loadSelectedConsumer = function() {
		var id = $stateParams.organizationId;
		if(!id || !$scope.selectedSource) return;
		$scope.selectedSource.consumers.forEach(function(consumer) {
			if(consumer[REQUESTOR_ID] == id) {
				$scope.selectedConsumer = consumer;
			}
		});
	};

	/* update access permission */
	$scope.updatePermission = function(access, source) {
		var func = access.enabled ? riox.access.enable : riox.access.disable;
		func(access, function() {
			growl.info("Successfully " + (access.enabled ? "enabled" : "disabled") + " consumer access.");
			reloadStreamConsumers(source);
		});
	}

	/* load main elements */
	loadStreamSources().
		then(prepareStreamSources).
		then(loadConsumers).
		then(loadSourceDetails).
		then(loadSelectedConsumer);

	$scope.selectedConsumer = $stateParams.organizationId;

});
