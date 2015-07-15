'use strict';

angular.module('rioxApp')
.controller('PricingCtrl', function ($scope, $state, $stateParams, growl) {

	$scope.selected = {};
	$scope.itemTypes =
		[
		 {id: TYPE_FIXED_PRICE, name: "Fixed Price"},
		 {id: TYPE_VARIABLE_PRICE, name: "Variable Price"}
		];
	$scope.pricingPeriods =
		[
		 {id: TIMEUNIT_MONTH, name: "Monthly", unitName: "Month"},
		 {id: TIMEUNIT_DAY, name: "Daily", unitName: "Day"}
		];

	$scope.$watch("sources", function(sources) {
		if(!sources) return;
		$scope.loadSourceDetails(sources, $stateParams.sourceId);
	});

	var loadPricingPlans = function() {
		$scope.plans = {};
		var query = {};
		riox.pricing.plans(query, function(plans) {
			$scope.$apply(function() {
				$scope.plans = plans;
			});
		});
	};

	$scope.addPlan = function() {
		$scope.selected.plan = {};
		$scope.selected.plan[ORGANIZATION_ID] = $scope.shared.selectedAPI[ORGANIZATION_ID];
	};

	$scope.savePlan = function() {
		var plan = $scope.selected.plan;
		if(!plan) return;
		if(!plan[ID]) {
			riox.add.pricing.plan(plan, function() {
				growl.info("Successfully added new pricing plan.");
				$scope.selected.plan = null;
				loadPricingPlans();
			});
		} else {
			riox.save.pricing.plan(plan, function() {
				growl.info("Pricing plan details saved.");
				loadPricingPlans();
			});
		}
	};
	$scope.deletePlan = function(item) {
		var idx = $scope.plans.indexOf(item);
		if(idx < 0) return;
		showConfirmDialog("Do you really want to permanently delete this pricing plan?", function() {
			$scope.selected.plan = null;
			// TODO implement
		});
	};

	$scope.addLimit = function() {
		var plan = $scope.selected.plan;
		if(!plan) return;
		if(!plan[LIMITS]) plan[LIMITS] = [];
		var item = $scope.selected.limit = {};
		plan[LIMITS].push(item);
	};
	$scope.deleteLimit = function(item) {
		var plan = $scope.selected.plan;
		if(!plan) return;
		var idx = plan[LIMITS].indexOf(item);
		if(idx < 0) return;
		plan[LIMITS].splice(idx, 1);
	};

	$scope.addItem = function() {
		var plan = $scope.selected.plan;
		if(!plan) return;
		var item = $scope.selected.item = {};
		item[TYPE] = TYPE_FIXED_PRICE;
		plan[PRICING_ITEMS].push(item);
	};
	$scope.deleteItem = function(i) {
		var plan = $scope.selected.plan;
		if(!plan) return;
		$scope.selected.item = null;
		var index = plan[PRICING_ITEMS].indexOf(i);
		plan[PRICING_ITEMS].splice(index, 1);
	};

	/* get nav. bar stack */
	$scope.getNavPart = function() {
		return { sref: "index.apis.pricing", name: "Pricing" };
	}
	$scope.setNavPath($scope, $state);

	/* load main elements */
	loadPricingPlans();
	$scope.userOrganizations = $scope.getCurrentUser().organizations;

});
