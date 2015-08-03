'use strict';

var auth = require('riox-services-base/lib/auth/auth.service');
var riox = require('riox-shared/lib/api/riox-api');
var Proxy = require('./proxy.model.js');

exports.show = function(req, res) {
	var query = {};
	Proxy.find(query, function(err, proxies) {
		if(err || !proxies)
			return res.status(500).json({error: "Unable to get proxies: " + err});
		res.json(proxies);
	});
};

exports.add = function(req, res) {
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

exports.save = function(req, res) {
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

exports.delete = function(req, res) {
	// TODO
};
