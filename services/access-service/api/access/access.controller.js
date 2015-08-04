'use strict';

var StreamAccess = require('./streamaccess.model');
var AccessRole = require('./accessrole.model');
var Consumer = require('./consumer.model');
var passport = require('passport');
var auth = require('riox-services-base/lib/auth/auth.service');
var riox = require('riox-shared/lib/api/riox-api');
var util = require('util');
var uuid = require('node-uuid');
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
	return StreamAccess.find(query, function (err, obj) {
		if (err) {
			return next(errors.InternalError("Cannot lookup stream", err));
		}
		if (!obj) {
			return next(errors.NotFoundError("No such stream-access"));
			//return res.send(404);
		}
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
	updatePermission(req, res, next, true);
};

exports.disableAccess = function (req, res, next) {
	updatePermission(req, res, next, false);
};

var updatePermission = function (req, res, next, allowed) {
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
		});
	});
};

/* METHODS FOR ACCESS ROLES */

exports.listRoles = function(req, res, next) {
	var user = auth.getCurrentUser(req);
	var query = {};
	query[ORGANIZATION_ID] = {"$in" : user.getOrganizationIDs()};
	AccessRole.find(query, function(err, list) {
		if (err)
			return next(errors.InternalError("Cannot list access roles.", err));
		res.json(list);
	});
};

exports.createRole = function(req, res, next) {
	var role = new AccessRole(req.body);
	var user = auth.getCurrentUser(req);
	/* check authorization */
	if(!role[ORGANIZATION_ID] || !user.hasOrganization(role[ORGANIZATION_ID])) {
		return res.status(422).json({error: "Please provide a valid " + ORGANIZATION_ID});
	}

	role.save(function(err, result) {
		if (err)
			return next(errors.InternalError("Cannot create role.", err));
		res.json(result);
	});
};

exports.updateRole = function(req, res, next) {
	var id = req.params.id;
	var user = auth.getCurrentUser(req);
	if(!id || id != req.body[ID]) {
		return res.status(400).json({error: "Invalid role " + ID});
	}
	AccessRole.findById(id, function(err, role) {
		if(err || !role) 
			return res.status(404).json({error: "Cannot find role with ID: " + id});
		/* check authorization for old organization */
		if(!user.hasOrganization(role[ORGANIZATION_ID])) {
			return res.status(401).json({error: "Cannot save this entity."});
		}
		/* check authorization for new organization*/
		if(!role[ORGANIZATION_ID] || !user.hasOrganization(req.body[ORGANIZATION_ID])) {
			return res.status(422).json({error: "Please provide a valid " + ORGANIZATION_ID});
		}

		/* copy info from request */
		role[ORGANIZATION_ID] = req.body[ORGANIZATION_ID];
		role[NAME] = req.body[NAME];
		/* save changes */
		role.save(function(err, role) {
			if(err || !role) 
				return res.status(404).json({error: "Cannot save role: " + err});
			res.json(role);
		});
	});
};

exports.deleteRole = function(req, res, next) {
	var id = req.params.id;
	var user = auth.getCurrentUser(req);
	if(!id) {
		return res.status(400).json({error: "Invalid role " + ID});
	}
	AccessRole.findById(id, function(err, role) {
		if(err || !role) 
			return res.status(404).json({error: "Cannot find role with ID: " + id});
		/* check authorization for organization */
		if(!user.hasOrganization(role[ORGANIZATION_ID])) {
			return res.status(401).json({error: "Cannot delete this entity."});
		}
		/* remove entity */
		role.remove(function(err, result) {
			if(err || !role) 
				return res.status(500).json({error: "Cannot delete role with ID: " + id});
			res.json(result);
		});
	});
};

/* METHODS FOR CONSUMERS */

exports.listConsumers = function(req, res, next) {
	var user = auth.getCurrentUser(req);
	var source = req.query.source;
	if(!source) {
		return res.status(400).json({error: "Please provide a valid source as query parameter"});
	}
	var query = {};
	riox.streams.source(source, {
		headers: req.headers,
		callback: function(sourceObj) {
			/* check authorization */
			if(!user.hasOrganization(sourceObj[ORGANIZATION_ID])) {
				return res.status(401).json({error: "Access denied"});
			}

			query[SOURCE_ID] = source;
			Consumer.find(query, function(err, list) {
				if (err)
					return next(errors.InternalError("Cannot list access roles.", err));
				res.json(list);
			});
		}
	}, function() {
		return res.status(404).json({error: "Please provide a valid source as query parameter"});
	});
};

var validateConsumer = function(req, res, sourceId, callback) {
	var user = auth.getCurrentUser(req);
	/* check request */
	if(!sourceId) {
		return res.status(422).json({error: "Please provide a valid " + SOURCE_ID});
	}
	if(req.params.id && req.body[ID] && req.params.id != req.body[ID]) {
		return res.status(400).json({error: "Invalid consumer " + ID});
	}
	riox.streams.source(sourceId, {
		headers: req.headers,
		callback: function(source) {

			/* check authorization */
			if(!source[ORGANIZATION_ID] || !user.hasOrganization(source[ORGANIZATION_ID])) {
				return res.status(401).json({error: "Access denied."});
			}

			callback(); /* success */
		}
	}, function(error) {
		return res.status(422).json({error: "Cannot find ID " + sourceId});
	});
};

exports.createConsumer = function(req, res, next) {
	/* check request, then save */
	validateConsumer(req, res, req.body[SOURCE_ID], function() {
		var consumer = new Consumer(req.body);
		var user = auth.getCurrentUser(req);

		consumer.save(function(err, result) {
			if (err)
				return next(errors.InternalError("Cannot create consumer.", err));
			res.json(result);
		});
	});
};

exports.updateConsumer = function(req, res, next) {
	/* check request, then save */
	validateConsumer(req, res, req.body[SOURCE_ID], function() {
		var consumer = new Consumer(req.body);
		var user = auth.getCurrentUser(req);
		var id = req.params.id;

		Consumer.findById(id, function(err, consumer) {
			if(err || !consumer) 
				return res.status(404).json({error: "Cannot find consumer with ID: " + id});

			/* copy info from request */
			consumer[SOURCE_ID] = req.body[SOURCE_ID];
			consumer[ACCESSROLE_ID] = req.body[ACCESSROLE_ID];
			consumer[NAME] = req.body[NAME];
			/* save changes */
			consumer.save(function(err, consumer) {
				if(err || !consumer) 
					return res.status(500).json({error: "Cannot save consumer: " + err});
				res.json(consumer);
			});
		});
	});
	
};

exports.deleteConsumer = function(req, res, next) {
	var id = req.params.id;
	var user = auth.getCurrentUser(req);
	if(!id) {
		return res.status(400).json({error: "Invalid consumer " + ID});
	}
	Consumer.findById(id, function(err, consumer) {
		if(err || !consumer) 
			return res.status(404).json({error: "Cannot find consumer with ID: " + id});
		/* TODO check authorization of the calling user! (probably navigate to SOURCE -> ORGANIZATION) */
		/* remove entity */
		consumer.remove(function(err, result) {
			if(err || !consumer) 
				return res.status(500).json({error: "Cannot delete consumer with ID: " + id});
			res.json(result);
		});
	});
};

exports.getConsumerByApiKey = function(req, res, next) {
	var apiKey = req.params.apiKey;
	if(!apiKey)
		return res.status(400).json({error: "Invalid API key in URL path"});
	var query = {};
	query[API_KEYS] = apiKey;
	Consumer.find(query, function(err, list) {
		if(err || !list || !list[0]) 
			return res.status(404).json({error: "Cannot find consumer with API Key: " + apiKey});
		res.json(list[0]);
	});
};

exports.addKey = function(req, res, next) {
	var id = req.params.id;
	Consumer.findById(id, function(err, consumer) {
		if(err || !consumer) 
			return res.status(404).json({error: "Cannot find consumer with ID: " + id});

		validateConsumer(req, res, consumer[SOURCE_ID], function() {
			/* create new key */
			var newKey = generateApiKey();
			consumer[API_KEYS].push(newKey);
			/* save changes */
			consumer.save(function(err, consumer) {
				if(err || !consumer)
					return res.status(500).json({error: "Cannot add API Key: " + err});
				res.json(consumer);
			});
		});
	});
};

var generateApiKey = function() {
	return uuid.v4();
};

exports.removeKey = function(req, res, next) {
	var id = req.params.id;
	var key = req.params.key;
	Consumer.findById(id, function(err, consumer) {
		if(err || !consumer) 
			return res.status(404).json({error: "Cannot find consumer with ID: " + id});

		validateConsumer(req, res, consumer[SOURCE_ID], function() {
			/* remove key */
			var idx = consumer[API_KEYS].indexOf(key);
			if(idx >= 0) {
				consumer[API_KEYS].splice(idx, 1);
				/* save changes */
				consumer.save(function(err, consumer) {
					if(err || !consumer)
						return res.status(500).json({error: "Cannot remove API Key: " + err});
					res.json(consumer);
				});
			}
		});
	});
};

/* HELPER METHODS */

var executeAsOwner = function (user, source, callback, errorCallback) {
	// TODO check if this user is the source owner
	callback();
};
