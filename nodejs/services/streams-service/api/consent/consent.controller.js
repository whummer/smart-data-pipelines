'use strict';

var StreamAccess = require('./accessconsent.model');
var passport = require('passport');
var auth = require('riox-services-base/lib/auth/auth.service');
var riox = require('riox-shared/lib/api/riox-api');
var util = require('util');

var log = global.log || require('winston');

exports.index = function(req, res, next) {
	var user = auth.getCurrentUser(req);

	riox.organizations({
		headers: req.headers,
		callback: function(orgs) {
			orgs.push(user); // for now, also consider the user ID

			var query = { $or: [] };

			orgs.forEach(function(org) {
				var crit1 = {}, crit2 = {};
				crit1[OWNER_ID] = org.id;
				crit2[REQUESTOR_ID] = org.id;
				query.$or.push(crit1);
				query.$or.push(crit2);
			});

			StreamAccess.find(query, function(err, list) {
				if (err)
					return res.send(500, err);
				res.json(200, list);
			});
		}
	});
};

exports.getBySource = function(req, res, next) {
	var user = auth.getCurrentUser(req);
	if(!req.params.sourceId) {
		res.json(422, {error: "Source ID is required in request path."});
		return;
	}
	var query = {};
	var crit1 = {}, crit2 = {};
	var requestorId = req.params.organizationId;
	if(requestorId) {
		crit2[REQUESTOR_ID] = requestorId;
	}
	query[SOURCE_ID] = req.params.sourceId;
	/*  make sure that the user has access to this access request, i.e.,
		user must be either 1) the owner, or 2) the requestor. */
	var list = user.getOrganizationIDs().concat(user.id);
	var isOwner = {}; isOwner[OWNER_ID] = { "$in": list };
	var isRequestor = {}; isRequestor[REQUESTOR_ID] = { "$in": list };
	query["$or"] = [isOwner, isRequestor];
//	console.log(JSON.stringify(query));
	return StreamAccess.find(query, function(err, obj) {
		if (err)
			return next(err);
		if (!obj)
			return res.send(404);
//		console.log(obj);
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
		if(user[ID] != obj[REQUESTOR_ID] && !user.hasOrganization(obj[REQUESTOR_ID])) {
			return res.send(401);
		}
		StreamAccess.remove(id, function(err, obj) {
			if (err) return res.send(500, err);
			return res.send(204);
		});
	});

};

exports.create = function(req, res, next) {
	var user = auth.getCurrentUser(req);
	var access = req.body;

	log.info("Creating new access request: ", util.inspect(access));
	var sourceId = access[SOURCE_ID];
	if(!sourceId) {
		res.json(422, {error: SOURCE_ID + " is required"});
		return;
	}
	if(!access[REQUESTOR_ID]) {
		log.error(REQUESTOR_ID + " is missing");
		res.json(422, {error: REQUESTOR_ID + " is required"});
		return;
	}
	if(access[REQUESTOR_ID] != user.id) {
		if(!user.hasOrganization(access[REQUESTOR_ID])) {
			return res.json(401, {error: "Invalid " + REQUESTOR_ID});
		}
	}
	riox.streams.source(sourceId, {
		callback: function(source) {
			access[CREATED] = access[CHANGED] = new Date().getTime();
			access[OWNER_ID] = source[ORGANIZATION_ID];
			access[STATUS] = STATUS_REQUESTED;
			StreamAccess.create(access, function() {
				res.json(200, access);
				/* Create notification (asynchronously). */
				createNotification(req, TYPE_ACCESS_REQUEST, access);
			});
		}, headers: req.headers
	}, function() {
		res.json(404, {message: "Cannot find entity with ID " + sourceId });
	});
};
