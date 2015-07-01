'use strict';

angular.module('rioxApp').controller('ApisCtrl', 
		function ($scope, $state, $stateParams, Formatter, $q) {

	/* CONSTANS */
	$scope.availableConnectors =
		[
			{name: "HTTP Connector", type: "http"},
			{name: "Websocket Connector", type: "ws"},
			{name: "MQTT Connector", type: "mqtt"}
		];

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
					if(!$scope.shared.selectedAPI[BACKEND_ENDPOINTS]) {
						$scope.shared.selectedAPI[BACKEND_ENDPOINTS] = [];
					}
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


	/* helper method: prepare the selected API object 
	 * for sending over the wire: clone and remove 
	 * fields which do not belong to the domain model */
	$scope.prepareApiObj = function() {
		var copy = clone($scope.shared.selectedAPI);
		/* defaults */
		if(!copy[OPERATIONS]) copy[OPERATIONS] = [];
		if(!copy[SCHEMAS]) copy[SCHEMAS] = [];
		/* clean model */
		delete copy.organization;
		delete copy.consumers;
		return copy;
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
	$scope.getNavPart = function() {
		return { sref: "index.apis.list", name: "APIs" };
	}
	$scope.setNavPath($scope, $state);

	/* load main elements */
	$scope.loadStreamSources().
		then($scope.prepareStreamSources).
		then($scope.loadStreamsConsumers).
		then($scope.loadSourceDetails);

});
