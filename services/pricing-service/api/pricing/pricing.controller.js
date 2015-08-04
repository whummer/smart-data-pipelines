'use strict';

var auth = require('riox-services-base/lib/auth/auth.service');
var util = require('riox-services-base/lib/util/util');
var PricingPlan = require('./pricing.plan.model');


exports.showPlans = function(req, res) {
	var user = auth.getCurrentUser(req);
	var query = {};
	PricingPlan.find(query, function(err, plans) {
		if(err || !plans)
			return res.status(500).json({error: "Unable to get pricing plans: " + err});
		res.json(plans);
	});
};

exports.addPlan = function(req, res) {
	var user = auth.getCurrentUser(req);
	var plan = new PricingPlan();
	plan[CREATION_DATE] = new Date();
	plan[CREATOR_ID] = user[ID];
	/* copy fields */
	copyPricingPlan(plan, req.body);
	/* check fields */
	if(!plan[ORGANIZATION_ID])
		return res.status(400).json({error: "Please provide a valid " + ORGANIZATION_ID});
	/* TODO check authorization (for ORGANIZATION_ID) */
	plan.save(function(err, plan) {
		if(err || !plan)
			return res.status(500).json({error: "Unable to save pricing plan: " + err});
		res.json(plan);
	});
};

exports.savePlan = function(req, res) {
	var id = req.params.id;
	if(id != req.body[ID]) {
		return res.status(400).json({error: "Please provide a valid " + ID});
	}
	/* TODO check authorization */
	PricingPlan.findById(id, function(err, plan) {
		if(err || !plan) {
			return res.status(500).json({error: "Cannot load pricing plan with ID " + id});
		}
		/* copy values */
		copyPricingPlan(plan, req.body);
		/* save */
		plan.save(function(err, plan) {
			res.json(plan);
		})
	});
};

exports.deletePlan = function(req, res) {
	// TODO
};

/* HELPER METHODS */

var copyPricingPlan = function(to, from) {
	to[NAME] = from[NAME];
	to[ORGANIZATION_ID] = from[ORGANIZATION_ID];
	to[PRICING_ITEMS] = from[PRICING_ITEMS];
	to[LIMITS] = from[LIMITS];
};
