'use strict';

var StreamAccess = require('./streamaccess.model');
var passport = require('passport');
var auth = require('riox-services-base/lib/auth/auth.service');
var riox = require('riox-shared/lib/api/riox-api');
var util = require('util');
var errors = require('riox-services-base/lib/util/errors');

var log = global.log || require('winston');

exports.index = function (req, res, next) {
	var user = auth.getCurrentUser(req);

	riox.organizations({
		headers: req.headers,
		callback: function (orgs) {
			orgs.push(user); // for now, also consider the user ID

			var query = {$or: []};

			orgs.forEach(function (org) {
				var crit1 = {}, crit2 = {};
				crit1[PROVIDER_ID] = org.id;
				crit2[REQUESTOR_ID] = org.id;
				query.$or.push(crit1);
				query.$or.push(crit2);
			});

			StreamAccess.find(query, function (err, list) {
				if (err) {
					return next(errors.InternalError("Cannot lookup stream-access", err));
					//return res.send(500, err);
				}

				res.json(200, list);
			});
		}
	});
};

exports.getBySource = function (req, res, next) {
	var user = auth.getCurrentUser(req);
	if (!req.params.sourceId) {
		return next(errors.UnprocessableEntity("Source ID is required in request path"));
		//res.json(422, {error: "Source ID is required in request path."});
		//return;
	}
	var query = {};
	var crit1 = {}, crit2 = {};
	var requestorId = req.params.organizationId;
	if (requestorId) {
		crit2[REQUESTOR_ID] = requestorId;
	}
	query[SOURCE_ID] = req.params.sourceId;
	/*  make sure that the user has access to this access request, i.e.,
	 user must be either 1) the owner, or 2) the requestor. */
	var list = user.getOrganizationIDs().concat(user.id);
	var isOwner = {}; isOwner[PROVIDER_ID] = { "$in": list };
	var isRequestor = {}; isRequestor[REQUESTOR_ID] = { "$in": list };
	query["$or"] = [isOwner, isRequestor];
//	console.log(JSON.stringify(query));
	return StreamAccess.find(query, function (err, obj) {
		if (err) {
			return next(errors.InternalError("Cannot lookup stream", err));
			//return next(err);
		}
		if (!obj) {
			return next(errors.NotFoundError("No such stream-access"));
			//return res.send(404);
		}
//		console.log(obj);
		res.json(obj);
	});
};

exports.show = function (req, res, next) {
	var id = req.params.id;

	StreamAccess.findById(id, function (err, obj) {
		if (err) {
			return next(errors.InternalError("Cannot lookup stream-access with ID " + id, err));
			//return next(err);
		}

		if (!obj) {
			return next(errors.NotFoundError("No such stream-access: " + id));
			//return res.send(404);
		}

		res.json(obj);
	});
};

exports.destroy = function (req, res, next) {
	var id = req.params.id;
	/* find entity */
	StreamAccess.findById(id, function (err, obj) {
		if (err) {
			return next(errors.InternalError("Cannot lookup stream-access with ID " + id, err));
		}

		if (!obj) {
			return next(errors.NotFoundError("No such stream-access: " + id));
		}

		/* check if user is permitted */
		var user = auth.getCurrentUser(req);
		if (user[ID] != obj[REQUESTOR_ID] && !user.hasOrganization(obj[REQUESTOR_ID])) {
			return next(errors.UnauthorizedError());
			//return res.send(401);
		}

		StreamAccess.remove(id, function (err, obj) {
			if (err)  {
				return next(errors.InternalError("Cannot remove stream-access with ID " + id, err));
				//return res.send(500, err);
			}

			return res.send(204);
		});
	});

};

exports.create = function (req, res, next) {
	var user = auth.getCurrentUser(req);
	var access = req.body;

	log.info("Creating new access request: ", util.inspect(access));
	var sourceId = access[SOURCE_ID];
	if (!sourceId) {
		return next(errors.UnprocessableEntity(SOURCE_ID + " is required"));
		//res.json(422, {error: SOURCE_ID + " is required"});
		//return;
	}

	if (!access[REQUESTOR_ID]) {
		return next(errors.UnprocessableEntity(SOURCE_ID + " is required"));

		//log.error(REQUESTOR_ID + " is missing");
		//res.json(422, {error: REQUESTOR_ID + " is required"});
		//return;
	}

	if (access[REQUESTOR_ID] != user.id) {
		if (!user.hasOrganization(access[REQUESTOR_ID])) {
			return next(errors.UnauthorizedError("Invalid " + REQUESTOR_ID));
			//return res.json(401, {error: "Invalid " + REQUESTOR_ID});
		}
	}
	riox.streams.source(sourceId, {
		callback: function (source) {
			access[CREATED] = access[CHANGED] = new Date().getTime();
			access[PROVIDER_ID] = source[ORGANIZATION_ID];
			access[STATUS] = STATUS_REQUESTED;
			StreamAccess.create(access, function () {
				res.json(200, access);
				/* Create notification (asynchronously). */
				createNotification(req, TYPE_ACCESS_REQUEST, access);
			});
		}, headers: req.headers
	}, function () {
		next(errors.NotFoundError("Cannot find entity with ID " + sourceId))
		//res.json(404, {message: "Cannot find entity with ID " + sourceId});
	});
};

var createNotification = function (req, type, access) {
	var notif = {};
	notif[TYPE] = type;
	if (type == TYPE_ACCESS_REQUEST) {
		notif[TEXT] = "User requested access to stream source #" + access[SOURCE_ID];
		notif[RECIPIENT_ID] = access[PROVIDER_ID];
	} else if(type == TYPE_ACCESS_UPDATE) {
		notif[TEXT] = "Access to stream source #" + access[SOURCE_ID] + " has been " +
			(access[STATUS] == STATUS_PERMITTED ? "enabled" : "disabled");
		notif[RECIPIENT_ID] = access[REQUESTOR_ID];
	}
	notif[STATUS] = STATUS_UNREAD;
	notif[PARAMS] = {};
	notif[PARAMS][SOURCE_ID] = access[SOURCE_ID];
	notif[PARAMS][REQUESTOR_ID] = access[REQUESTOR_ID];
	riox.add.notification(notif, {
		headers: req.headers
	});
}

exports.enableAccess = function (req, res, next) {
	updatePermission(req, res, true);
};

exports.disableAccess = function (req, res, next) {
	updatePermission(req, res, false);
};

var updatePermission = function (req, res, allowed) {
	var user = auth.getCurrentUser(req);
	var id = req.params.id;
	if (!id) {
		return next(errors.UnprocessableEntity("No stream-access ID given"));
	}

	StreamAccess.findById(id, function (err, obj) {
		if (err) {
			return next(errors.InternalError("Cannot lookup stream-access with ID " + id, err));
		}

		if (!obj) {
			return next(errors.NotFoundError("No such stream-access: " + id));
		}

		executeAsOwner(user, obj, function () {
			obj[STATUS] = allowed ? STATUS_PERMITTED : STATUS_DENIED;
			obj.save(function (err, obj) {
				createNotification(req, TYPE_ACCESS_UPDATE, obj);
				res.json(obj);
			});
		}, function (error) {
			return next(errors.UnauthorizedError("Not authorized", error));
			//return res.send(401, {error: error});
		});
	});
};

var executeAsOwner = function (user, source, callback, errorCallback) {
	// TODO check if this user is the source owner
	callback();
};
