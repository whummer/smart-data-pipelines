'use strict';

angular.module('rioxApp')
.controller('RatingCtrl', function ($scope, $state, $stateParams, growl) {

	$scope.selected = {};
	$scope.appliesTo = "role";
	$scope.timeUnits =
		[
			{value: TIMEUNIT_MINUTE, label: "Minute"},
			{value: TIMEUNIT_HOUR, label: "Hour"},
			{value: TIMEUNIT_DAY, label: "Day"},
			{value: TIMEUNIT_MONTH, label: "Month"}
		];

	$scope.$watch("sources", function(sources) {
		if(!sources) return;
		$scope.loadSourceDetails(sources, $stateParams.sourceId);
		loadRateLimits();
		loadConsumers();
		loadAccessRoles();
	});

	var loadConsumers = function() {
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

	var loadAccessRoles = function() {
		riox.access.roles(function(roles) {
			$scope.$apply(function() {
				$scope.accessRoles = roles;
			});
		});
	};

	/* METHODS FOR RATE LIMITS */

	var loadRateLimits = function() {
		var source = $scope.shared.selectedAPI;
		if(!source) return;
		var query = {};
		query[SOURCE_ID] = source[ID];
		riox.ratings.limits(query, function(limits) {
			$scope.$apply(function() {
				$scope.rateLimits = limits;
				$scope.selected.limit = null;
			});
		});
	};
	$scope.addRateLimit = function() {
		var limit = {};
		$scope.appliesTo = "role";
		$scope.selected.limit = limit;
	};
	$scope.saveRateLimit = function() {
		var limit = $scope.selected.limit;
		if(!limit) return;
		if($scope.appliesTo == "role") {
			delete limit[CONSUMER_ID];
		} else if($scope.appliesTo == "consumer") {
			delete limit[ACCESSROLE_ID];
		}
		var error = function(err) {
			var err = err.responseJSON;
			if(err.__result) err = err.__result;
			growl.warning("Cannot save rate limit: " + err.error);
		};
		if(!limit[ID]) {
			riox.add.rating.limit(limit, function(limit) {
				growl.info("Rate limit successfully added.");
				loadRateLimits();
				$scope.$apply();
			}, error);
		} else {
			riox.save.rating.limit(limit, function(limit) {
				growl.info("Changes successfully saved.");
				$scope.selected.limit = limit;
				$scope.$apply();
			}, error);
		}
	};
	$scope.deleteRateLimit = function(limit) {
		showConfirmDialog("Do you really want to delete this rate limit?", function() {
			riox.delete.rating.limit(limit, function(limit) {
				growl.info("Rate limit successfully deleted.");
				loadRateLimits();
			}, function(err) {
				growl.warning("Unable to delete rate limit");
			});
		});
	};

	/* get nav. bar stack */
	$scope.getNavPart = function() {
		return { sref: "index.apis.rating", name: "Rating" };
	}
	$scope.setNavPath($scope, $state);

});
