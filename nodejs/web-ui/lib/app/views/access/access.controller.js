'use strict';

angular.module('rioxApp')
.controller('AccessCtrl', function ($scope, $state, $stateParams, growl) {

	$scope.selected = {};

	$scope.$watch("sources", function(sources) {
		if(!sources) return;
		$scope.loadSourceDetails(sources, $stateParams.sourceId);
	});

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
	
	$scope.loadOrganizations = function() {
		riox.organizations(function(orgs) {
			$scope.$apply(function() {
				$scope.userOrganizations = orgs;
			});
		});
	};

	/* register event listeners */
	$scope.$watch("shared.selectedAPI", function(s) {
		if(!s) return;
		loadSelectedConsumer();
	});

	/* get nav. bar stack */
	$scope.getNavPart = function() {
		return { sref: "index.apis.access", name: "Access Control" };
	}
	$scope.setNavPath($scope, $state);

	/* load main elements */
	$scope.loadAccessRoles();
	$scope.loadOrganizations();
});
