'use strict';

angular.module('rioxApp')
.controller('AccessCtrl', function ($scope, Auth, $stateParams) {


	/* load selected consumer */
	var loadSelectedConsumer = function() {
		var id = $stateParams.organizationId;
		if(!id || !$scope.shared.selectedAPI) return;
		$scope.shared.selectedAPI.consumers.forEach(function(consumer) {
			if(consumer[REQUESTOR_ID] == id) {
				$scope.selectedConsumer = consumer;
			}
		});
	};

	/* load user consents for a list of stream sources */
	var loadConsents = function(sources) {
		var promise = $q.when(1);
		$.each(sources, function(idx,el) {
			promise = promise.then(function() {
				return $q(function(resolve, reject) {
					loadStreamConsents(el).then(function() {
						resolve(sources);
					});
				});
			});
		});
		return promise;
	};

	/* load user consents */
	var loadStreamConsents = function(source) {
		if(source.consents) return;
		var deferred = $q.defer();
		var query = {};
		query[SOURCE_ID] = source.id;
		riox.consents(query, function(consents) {
			source.consents = consents;
			var promise = $q.when(1);
			consents.forEach(function(cons) {
				promise = promise.then(function() {
					return $q(function(resolve, reject) {
						riox.organization(cons[REQUESTOR_ID], function(org) {
							cons.requestorOrg = org;
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

	/* update access permission */
	$scope.updatePermission = function(access, source) {
		var func = access.enabled ? riox.access.enable : riox.access.disable;
		func(access, function() {
			growl.info("Successfully " + (access.enabled ? "enabled" : "disabled") + " consumer access.");
			reloadStreamConsumers(source);
		});
	}

	/* register event listeners */
	$scope.$watch("shared.selectedAPI", function(s) {
		if(!s) return;
		loadSelectedConsumer();
	});

});
