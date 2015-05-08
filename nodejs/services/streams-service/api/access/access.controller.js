'use strict';

var StreamAccess = require('./streamaccess.model');
var passport = require('passport');
var auth = require('riox-services-base/lib/auth/auth.service');
var riox = require('riox-shared/lib/api/riox-api');

exports.index = function(req, res, next) {
	var user = auth.getCurrentUser(req);
	var crit1 = {}, crit2 = {};
	crit1[OWNER_ID] = user.id;
	crit2[REQUESTOR_ID] = user.id;
	var query = { $or: [crit1, crit2] };

	StreamAccess.find(query, function(err, list) {
		if (err)
			return res.send(500, err);
		res.json(200, list);
	});
};

exports.getBySource = function(req, res, next) {
	var user = auth.getCurrentUser(req);
	var crit1 = {}, crit2 = {};
	crit1[OWNER_ID] = user.id;
	crit2[REQUESTOR_ID] = user.id;
	var query = {
			$or: [crit1, crit2]
	};
	query[SOURCE_ID] = req.params.sourceId;
	return StreamAccess.find(query, function(err, obj) {
		if (err)
			return next(err);
		if (!obj)
			return res.send(404);
		res.json(obj);
	});
};

exports.show = function(req, res, next) {
	var id = req.params.id;

	StreamAccess.findById(id, function(err, obj) {
		if (err)
			return next(err);
		if (!obj)
			return res.send(404);
		res.json(obj);
	});
};

exports.destroy = function(req, res, next) {
	// TODO
};

exports.create = function(req, res, next) {
	var access = req.body;
	var sourceId = access[SOURCE_ID];
	if(!sourceId) {
		res.json(422, {error: SOURCE_ID + " is required"});
		return;
	}
	riox.streams.source(sourceId, {
		callback: function(source) {
			access.created = access.changed = new Date().getTime();
			var user = auth.getCurrentUser(req);
			access[REQUESTOR_ID] = user.id;
			StreamAccess.create(access, function() {
				res.json(200, access);
			});
		}, headers: req.headers
	});
};
