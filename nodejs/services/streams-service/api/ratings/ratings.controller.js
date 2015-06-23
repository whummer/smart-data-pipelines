 'use strict';

var auth = require('riox-services-base/lib/auth/auth.service');
var Invocation = require('./invocation.model');
var RateLimit = require('./rate.limit.model');

exports.logAndPermit = function(req, res) {
	var inv = new Invocation(req);

	inv.save(function(err, invSaved) {
		if(err) return res.status(500).json({});
		var response = {};
		response[STATUS] = STATUS_PERMITTED;
		res.json(response);
	});

};

exports.showLimits = function(req, res) {
	var query = {};
	RateLimit.find(query, function(err, list) {
		if(err) return res.status(500).json({error: "Cannot load rate limits: " + err});
		res.json(list);
	});
};

var checkLimitEntity = function(req, res) {
	var id = req.params.id;
	if(id && id != req.body[ID]) {
		res.status(400).json({error: "Please provide a valid " + ID});
		return false;
	}
	if(!req.body[OPERATION_ID]) {
		res.status(422).json({error: "Please provide a valid operation for this rate limit"});
		return false;
	}
	if(!req.body[TIMEUNIT]) {
		res.status(422).json({error: "Please provide a valid time unit for this rate limit"});
		return false;
	}
	if(!req.body[CONSUMER_ID] && !req.body[ACCESSROLE_ID]) {
		res.status(422).json({error: "Please provide either a consumer or an access role for this rate limit"});
		return false;
	}
	if(!isNumber(req.body[AMOUNT])) {
		res.status(422).json({error: "Please provide a valid numeric " + AMOUNT});
		return false;
	}
	return true;
};

exports.saveLimit = function(req, res) {
	var id = req.params.id;
	if(!checkLimitEntity(req, res)) {
		return;
	}
	/* TODO check authorization */
	RateLimit.findById(id, function(err, limit) {
		if(err || !limit) {
			return res.status(500).json({error: "Cannot load rate limit with ID " + id});
		}
		/* copy values */
		limit[OPERATION_ID] = req.body[OPERATION_ID];
		limit[CONSUMER_ID] = req.body[CONSUMER_ID];
		limit[ACCESSROLE_ID] = req.body[ACCESSROLE_ID];
		limit[TYPE] = req.body[TYPE];
		limit[TIMEUNIT] = req.body[TIMEUNIT];
		limit[AMOUNT] = req.body[AMOUNT];
		/* save */
		limit.save(function(err, limit) {
			res.json(limit);
		})
	});
};

exports.addLimit = function(req, res) {
	var user = auth.getCurrentUser(req);
	var limit = new RateLimit(req.body);

	if(!checkLimitEntity(req, res)) {
		return;
	}

	/* TODO check authorization */
	limit[CREATION_DATE] = new Date();
	limit[CREATOR_ID] = user[ID];
	limit.save(function(err, limit) {
		if(err) return res.status(500).json({error: "Cannot add rate limit: " + err});
		res.json(limit);
		
	});
};

exports.deleteLimit = function(req, res) {
	var id = req.params.id;
	/* TODO check authorization */
	RateLimit.findById(id, function(err, limit) {
		if(err || !limit)
			return res.status(500).json({error: "Cannot find rate limit with ID " + id});
		limit.remove(function(err, result) {
			res.json(result);
		});
	});
};

/* HELPER METHODS */

function isNumber(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}
