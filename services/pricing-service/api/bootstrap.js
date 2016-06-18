"use strict";

var PricingPlan = require('./pricing/pricing.plan.model');
var riox = require('riox-shared/lib/api/riox-api');
var riox = require('riox-shared/lib/api/riox-api-admin')(riox);

function insertPricingPlans() {
	var plans = [{
		"organization-id": "000000000001",
		"name": "Plan A",
		"pricing-items":
		[
			 { "type": "FIXED", "period": "MONTH", "amount": 100 }
		]
	},{
		"organization-id": "000000000001",
		"name": "Plan B",
		"pricing-items":
		[
			 { "type": "FIXED", "period": "MONTH", "amount": 500 }
		]
	},{
		"organization-id": "000000000001",
		"name": "Plan C",
		"pricing-items":
		[
			 { "type": "FIXED", "period": "MONTH", "amount": 2000 }
		]
	},{
		"organization-id": "000000000001",
		"name": "Plan D",
		"pricing-items":
		[
			 { "type": "FIXED", "period": "MONTH", "amount": 3500 }
		]
	}];

	console.log("insert plans");
	plans.forEach(function(plan) {
		var planObj = new PricingPlan(plan);
		planObj.save();
	});
};

module.exports.insertDefaultElements = function () {
	insertPricingPlans();
};
