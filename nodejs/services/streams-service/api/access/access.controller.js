'use strict';

var StreamAccess = require('./streamaccess.model');
var passport = require('passport');
var jwt = require('jsonwebtoken');
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
	var id = req.params.id;
	/* find entity */
	StreamAccess.findById(id, function(err, obj) {
		if (err) return next(err);
		if (!obj) return res.send(404);

		/* check if user is permitted */
		var user = auth.getCurrentUser(req);
		riox.organizations({
			callback: function(orgs) {
				var found = false;
				orgs.forEach(function(org) {
					if(obj[REQUESTOR_ID] == org.id ||
							obj[REQUESTOR_ID] == user.id) {
						console.log("permitted");
						found = true;
						StreamAccess.remove(id, function(err, obj) {
							if (err) return res.send(500, err);
							return res.send(204);
						});
					}
				});
				if(!found) {
					return res.send(401);
				}
			},
			headers: req.headers
		});
	});

};

exports.create = function(req, res, next) {
	var user = auth.getCurrentUser(req);
	var access = req.body;
	var sourceId = access[SOURCE_ID];
	if(!sourceId) {
		res.json(422, {error: SOURCE_ID + " is required"});
		return;
	}
	if(!access[REQUESTOR_ID]) {
		access[REQUESTOR_ID] = user.id; // TODO lookup organization ID.
	}
	riox.streams.source(sourceId, {
		callback: function(source) {
			access.created = access.changed = new Date().getTime();
			StreamAccess.create(access, function() {
				res.json(200, access);
			});
		}, headers: req.headers
	}, function() {
		res.json(404, {message: "Cannot find entity with ID " + sourceId });
	});
};
