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
	
	var CACHE_ORGANIZATIONS = {};

	/** load proxies */
	$scope.loadProxies = function() {
		var promise = $q(function(resolve, reject) {
			riox.proxies({}, function(list) {
				$scope.$apply(function() {
					$scope.proxies = list;
					resolve(list);
				});
			});
		});
		return promise;
	};

	/** load proxy details */
	$scope.loadProxyDetails = function(list, id) {
		if(!id) return;
		if(!list) list = $scope.proxies;
		var promise = $q(function(resolve, reject) {
			list.forEach(function(proxy) {
				if(proxy.id == id) {
					$scope.shared.selectedAPI = $scope.shared.selectedAPI = proxy;
					if(!$scope.shared.selectedAPI[BACKEND_ENDPOINTS]) {
						$scope.shared.selectedAPI[BACKEND_ENDPOINTS] = [];
					}
				}
			});
			resolve();
		});
		return promise;
	};

	/** prepare proxies (load organization details, ...) */
	$scope.prepareProxies = function(list) {
		var promise = $q.when(1);
		angular.forEach(list, function(el) {
			promise = promise.then(function() {
				return $q(function(resolve, reject) {
					$scope.prepareProxy(el, resolve);
				});
			});
		});
		promise = promise.then(function() {
			return $q(function(resolve, reject) {
				resolve(list);
			})
		});
		setTimeout(function() {
			/* reset cache after a short time */
			CACHE_ORGANIZATIONS = {};
		}, 10*1000);
		return promise;
	};

	/** prepare a single proxy (load organization image, ...) */
	$scope.prepareProxy = function(el, callback) {
		if(el[ORGANIZATION_ID]) {
			riox.organization(el[ORGANIZATION_ID], {
				callback: function(org) {
					if(org[IMAGE_DATA] && org[IMAGE_DATA][0]) {
						el.organizationImg = org[IMAGE_DATA][0].href;
					}
					el.organization = org;
					if(callback) callback();
				},
				cache: CACHE_ORGANIZATIONS
			});
		} else {
			if(callback) callback();
		}
	}

	/** load the consumers of a list of proxies */
	$scope.loadProxiesConsumers = function(proxies) {
		var promise = $q.when(1);
		$.each(proxies, function(idx,el) {
			promise = promise.then(function() {
				return $q(function(resolve, reject) {
					loadProxyConsumers(el).then(function() {
						resolve(proxies);
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

	/* helper methods: load consumers for a single proxy */
	
	var reloadProxyConsumers = function(proxy) {
		proxy.consumers = null;
		loadProxyConsumers(proxy);
	}
	var loadProxyConsumers = function(proxy) {
		if(proxy.consumers) return;
		var deferred = $q.defer();
		var query = {};
		query[SOURCE_ID] = proxy.id;
		riox.access(query, function(accesses) {
			proxy.consumers = accesses;
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
	$scope.loadProxies().
		then($scope.prepareProxies).
		then($scope.loadProxiesConsumers).
		then($scope.loadProxyDetails);

});
