'use strict';

angular.module('rioxApp')
.controller('AccessCtrl', function ($scope, $state, $stateParams, growl) {

	$scope.selected = {};

	$scope.$watch("sources", function(sources) {
		if(!sources) return;
		$scope.loadSourceDetails(sources, $stateParams.sourceId);
	});

	
	$scope.loadOrganizations = function() {
		riox.organizations(function(orgs) {
			$scope.$apply(function() {
				$scope.userOrganizations = orgs;
			});
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

	/* METHODS FOR ACCESS ROLES */

	$scope.addAccessRole = function() {
		var role = {};
		role[NAME] = "New Role";
		$scope.selected.role = role;
	};
	$scope.loadAccessRoles = function() {
		riox.access.roles(function(roles) {
			$scope.$apply(function() {
				$scope.accessRoles = roles;
			});
		});
	};
	$scope.saveRole = function() {
		var role = $scope.selected.role;
		if(!role) return;
		var error = function(err) {
			var result = err.responseJSON;
			if(result.__result) result = result.__result;
			growl.warning("Unable to save role: " + result.error);
			return false;
		}
		if(!role[ID]) {
			riox.add.access.role(role, function(role) {
				$scope.loadAccessRoles();
				growl.info("New access role has been added.");
				$scope.$apply(function() {
					$scope.selected.role = null;
				});
			}, error);
		} else {
			riox.save.access.role(role, function(role) {
				$scope.loadAccessRoles();
				growl.info("Access role details saved.");
			}, error);
		}
	};
	$scope.deleteRole = function(role) {
		if(!role) return;
		showConfirmDialog("Are you sure that you want to permanently delete this access role?", function() {
			riox.delete.access.role(role, function() {
				$scope.selected.role = null;
				$scope.loadAccessRoles();
				growl.info("Access role has been deleted.");
			});
		});
	};

	/* METHODS FOR CONSUMERS */

	$scope.addConsumer = function() {
		var source = $scope.shared.selectedAPI;
		if(!source) {
			growl.warning("Please select an API first.");
			return;
		}
		var consumer = {};
		consumer[NAME] = "New Consumer";
		consumer[SOURCE_ID] = source[ID];
		$scope.selected.consumer = consumer;
	};
	$scope.loadConsumers = function() {
		var source = $scope.shared.selectedAPI;
		if(!source) return;
		var query = {};
		query[SOURCE_ID] = source[ID];
		riox.access.consumers(query, function(consumers) {
			$scope.$apply(function() {
				$scope.accessConsumers = consumers;
			});
		});
	};
	$scope.saveConsumer = function() {
		var consumer = $scope.selected.consumer;
		if(!consumer) return;
		var error = function(err) {
			var result = err.responseJSON;
			if(result.__result) result = result.__result;
			growl.warning("Unable to save consumer: " + result.error);
			return false;
		}
		if(!consumer[ID]) {
			riox.add.access.consumer(consumer, function(consumer) {
				$scope.loadConsumers();
				growl.info("New consumer has been added.");
				$scope.$apply(function() {
					$scope.selected.consumer = null;
				});
			}, error);
		} else {
			riox.save.access.consumer(consumer, function(role) {
				$scope.loadConsumers();
				growl.info("Consumer details saved.");
			}, error);
		}
	};
	$scope.deleteConsumer = function(consumer) {
		if(!consumer) return;
		showConfirmDialog("Are you sure that you want to permanently delete this consumer?", function() {
			riox.delete.access.consumer(consumer, function() {
				$scope.selected.consumer = null;
				$scope.loadConsumers();
				growl.info("Consumer has been deleted.");
			});
		});
	};

	/* add/generate API key */
	$scope.addApiKey = function() {
		console.log("TODO add key");
	};

	/* register event listeners */
	$scope.$watch("shared.selectedAPI", function(s) {
		if(!s) return;
		loadSelectedConsumer();
		$scope.loadConsumers();
	});

	/* get nav. bar stack */
	$scope.getNavPart = function() {
		return { sref: "index.apis.access", name: "Access Control" };
	}
	$scope.setNavPath($scope, $state);

	/* load main elements */
	$scope.loadAccessRoles();
	$scope.loadOrganizations();
	
	
	
	

	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	// TODO remove?
	
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

	
});
