'use strict';

var AnalyticsFunction = require('./analytics.model.js');
var config = require('../../config/environment');

var log = global.log || require('winston');

var validationError = function(res, err) {
	return res.json(422, err);
};

/**
 * Lists all analytics functions available in the system. They are currently defined
 * in ../../config/analytics_functions.js with a seed in ../../app.js.
 */
function listFunctions(query, req, res) {
	log.debug("query:", query);
	AnalyticsFunction.find(query, function(err, list) {
		if (err) {
			log.debug("err:", err);
			return res.send(500, err);
		}
		//log.debug("list: ", list);
		res.json(200, list);
	});
}

function createAnalyticsElement(query, req, res) {
}

exports.index = function(req, res) {
	var query = {};
	if (req.query.name) {
		query = {name: req.query.name};
	}

	log.info("Listing analytics function. Using query: ", query);
	return listFunctions(query, req, res);
};


//exports.create = function(req, res) {
//	var obj = new AnalyticsFunction(req.body);
//	obj.save(req.params.id, function(err, obj) {
//		if (err)
//			return validationError(res, err);
//		res.json(obj);
//	});
//};


//
//exports.show = function(req, res, next) {
//	var id = req.params.id;
//	var query = {_id: id};
//	Organization.find(query, function(err, obj) {
//		if (err)
//			return next(err);
//		if (!obj || !obj.length)
//			return res.send(401);
//		res.json(obj[0]);
//	});
//};
//
//exports.destroy = function(req, res) {
//	Organization.findByIdAndRemove(req.params.id, function(err, obj) {
//		if (err)
//			return res.send(500, err);
//		return res.send(204);
//	});
//};
