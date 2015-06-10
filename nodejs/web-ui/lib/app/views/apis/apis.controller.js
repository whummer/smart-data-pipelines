'use strict';

angular.module('rioxApp').controller('ApisCtrl', 
		function ($scope, Auth, $stateParams, Formatter, $q) {

	/** load stream sources */
	$scope.loadStreamSources = function() {
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

	/** load stream source details */
	$scope.loadSourceDetails = $scope.loadSourceDetails = function(sources, id) {
		if(!id) return;
		if(!sources) sources = $scope.sources;
		var promise = $q(function(resolve, reject) {
			sources.forEach(function(source) {
				if(source.id == id) {
					$scope.shared.selectedAPI = $scope.shared.selectedAPI = source;
				}
			});
			resolve();
		});
		return promise;
	};

	/** prepare stream sources (load organization details, ...) */
	$scope.prepareStreamSources = function(list) {
		var promise = $q.when(1);
		angular.forEach(list, function(el) {
			promise = promise.then(function() {
				return $q(function(resolve, reject) {
					$scope.prepareStreamSource(el, resolve);
				});
			});
		});
		promise = promise.then(function() {
			return $q(function(resolve, reject) {
				resolve(list);
			})
		});
		return promise;
	};

	/** prepare a single stream source (load organization image, ...) */
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

	/** load the consumers of a list of streams */
	$scope.loadStreamsConsumers = function(sources) {
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

	/* get nav. bar stack */
	$scope.getNavPath = function() {
		var path = [
			{ sref: "index.apis.list", name: "APIs" }
		];
		$scope.shared.navigationPath = path;
		return path;
	};

	/* load main elements */
	$scope.loadStreamSources().
		then($scope.prepareStreamSources).
		then($scope.loadStreamsConsumers).
		then($scope.loadSourceDetails);

});
