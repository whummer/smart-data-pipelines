'use strict';

var Organization = require('./organization.model');
var Membership = require('./membership.model');
var auth = require('riox-services-base/lib/auth/auth.service');
var ObjectId = require('mongoose').Types.ObjectId; 

/* constants */
var CREATOR_ID = "creator-id";
var NAME = "name";
var ORGANIZATION_ID = "organization-id";
var IMAGE_DATA = "image-data";

var validationError = function(res, err) {
	return res.json(422, err);
};

function list(query, req, res) {
	Organization.find(query, function(err, list) {
		if (err)
			return res.send(500, err);
		res.json(200, list);
	});
}

exports.index = function(req, res) {
	return list({}, req, res);
};

exports.create = function(req, res, next) {
	var user = auth.getCurrentUser(req);
	var newOrg = req.body;
	newOrg[CREATOR_ID] = user.id;
	var newObj = new Organization(newOrg);
	newObj.save(function(err, obj) {
		if (err)
			return validationError(res, err);
		res.json(obj);
	});
};

exports.update = function(req, res) {
	var obj = new Organization(req.body);
	var user = auth.getCurrentUser(req);
	var orgId = req.params.id;
	// check if IDs match
	if(orgId != obj.id) {
		return validationError(res, err);
	}
	var query = {_id: orgId};
	Organization.find(query, function(err, list) {
		if (err)
			return next(err);
		if (!list || !list.length)
			return res.send(404);
		var existing = list[0];
		// check if this is the org's owner
		if (existing[CREATOR_ID] != user.id)
			return res.send(401);
		/* copy info to existing entity */
		existing[IMAGE_DATA] = obj[IMAGE_DATA];
		existing[NAME] = obj[NAME];

		existing.save(function(err, obj) {
			if (err)
				return validationError(res, err);
			res.json(obj);
		});
	});
};

exports.getOwnAll = function(req, res, next) {
	var user = auth.getCurrentUser(req);
	findOrCreateDefault(user.id, function(org) {
		var result = [org];
		var query = {member: user.id};
		Membership.find(query, function(err, list) {
			if (err)
				return next(err);
			var ids = [];
			list.forEach(function(el) {
				ids.push(el[ORGANIZATION_ID]);
			});
			query = {id: {$in: ids} };
			Organization.find(query, function(err, list) {
				if (err)
					return next(err);
				list.forEach(function(el) {
					result.push(el);
				});
				res.json(result);
			});
		});
	}, function(error) {
		return next(error);
	});
}

exports.getOwnDefault = function(req, res, next) {
	var user = auth.getCurrentUser(req);
	findOrCreateDefault(user.id, function(org) {
		res.json(org);
	}, function(error) {
		return next(error);
	});
};

exports.show = function(req, res, next) {
	var id = req.params.id;
	findSingle(id, function(org) {
		res.json(org);
	}, function(error) {
		next(error);
	});
};

exports.destroy = function(req, res) {
	Organization.findByIdAndRemove(req.params.id, function(err, obj) {
		if (err)
			return res.send(500, err);
		return res.send(204);
	});
};

exports.updateMembership = function(req, res, next) {
	var mem = req.body;
	auth.getCurrentUserDetails(req, function(user) {
		var query = {_id: mem.id};
		Membership.find(query, function(err, list) {
			if (err)
				return next(err);
			if (!list || !list.length) {
				return next(404);
			}
			var existingMem = list[0];
			/* check permissions */
			if(existingMem.member != user.email &&
					existingMem.member != user.id &&
					existingMem[CREATOR_ID] != user.id) {
				return next(401);
			}
			/* copy info to existing entity */
			existingMem.status = mem.status;

			existingMem.save(function(err, updated) {
				if (err)
					return next(err);
				res.json(updated);
			});
		});
	});
};

exports.invite = function(req, res, next) {
	var user = auth.getCurrentUser(req);
	var inv = req.body;
	inv[CREATOR_ID] = user.id;
	/* check for existing invite */
	var query = {};
	query[ORGANIZATION_ID] = inv[ORGANIZATION_ID];
	query["invitee"] = inv["invitee"];
	query[CREATOR_ID] =inv[CREATOR_ID];
	Membership.find(query, function(err, list) {
		if (err)
			return next(err);
		if (!list || !list.length) {
			/* save new */
			var newMem = new Membership(inv);
			newMem.status = Membership.STATUS_PENDING;
			newMem.save(function(err, result) {
				res.json(result);
			});
		} else {
			/* return existing */
			var mem = list[0];
			res.json(mem);
		}
	});
};

/* HELPER METHODS */

var findSingle = function(id, callback, errorCallback) {
	var query = {_id: id};
	Organization.find(query, function(err, obj) {
		if (err)
			return errorCallback(err);
		if (!obj || !obj.length)
			return errorCallback(404);
		callback(obj[0]);
	});
}

var findOrCreateDefault = function(userId, callback, errorCallback) {
	var query = {}
	query[CREATOR_ID] = userId;
	Organization.find(query, function(err, list) {
		if (err)
			return errorCallback(err);
		if (list.length) {
			callback(list[0]);
		} else {
			var newObj = {};
			newObj[NAME] = "Default Organization";
			newObj[CREATOR_ID] = userId;
			var newObj = new Organization(newObj);
			newObj.save(function(err, obj) {
				if (err)
					return errorCallback(err);
				callback(obj);
			});
		}
	});
}
