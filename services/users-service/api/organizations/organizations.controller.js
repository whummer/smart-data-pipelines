'use strict';

var mongoose = global.mongoose || require('mongoose');
var Organization = require('./organization.model');
var Membership = require('./membership.model');
var util = require('riox-services-base/lib/util/util');
var email = require('riox-services-base/lib/util/email');
var auth = require('riox-services-base/lib/auth/auth.service');
var riox = require('riox-shared/lib/api/riox-api');

var validationError = function(res, err) {
	return res.json(422, err);
};

var list = function(query, req, res) {
	Organization.find(query, function(err, list) {
		if (err)
			return res.send(500, err);
		res.json(list);
	});
};

exports.index = function(req, res) {
	return list({}, req, res);
};

exports.create = function(req, res, next) {
	var user = auth.getCurrentUser(req);
	var newOrg = req.body;
	newOrg[CREATOR_ID] = user[ID];
	/* make sure we have a domain name */
	if(!newOrg[DOMAIN_NAME]) {
		newOrg[DOMAIN_NAME] = util.genShortUUID();
	}
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
		if (existing[CREATOR_ID] != user[ID])
			return res.send(401);
		/* copy info to existing entity */
		existing[IMAGE_DATA] = obj[IMAGE_DATA];
		existing[NAME] = obj[NAME];
		existing[DOMAIN_NAME] = obj[DOMAIN_NAME];

		existing.save(function(err, obj) {
			if (err)
				return validationError(res, err);
			res.json(obj);
		});
	});
};

exports.getOwnAll = function(req, res, next) {
	var user = auth.getCurrentUser(req);
	findOrCreateDefault(user[ID], function(org) {
		var result = [org];
		var query = {};
		query[MEMBER] = user[ID].toString ? user[ID].toString() : user[ID];
		if(typeof req.query.all == "undefined") {
			query[STATUS] = STATUS_CONFIRMED;
		}
		Membership.find(query, function(err, list) {
			if (err)
				return next(err);
			var ids = [];
			list.forEach(function(el) {
				ids.push(el[ORGANIZATION_ID]);
			});
			query = {};
			query["_id"] = {"$in": ids};
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
	findOrCreateDefault(user[ID], function(org) {
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
	var user = auth.getCurrentUser(req);
	Organization.findById(req.params.id, function(err, org) {
		if (err) return res.send(500, err);
		if (!org) return res.send(404);
		if(user[ID] != org[CREATOR_ID]) {
			return res.send(401, {error: "Only the owner can delete an organization."});
		}
		Organization.findByIdAndRemove(req.params.id, function(err, obj) {
			if (err) return res.send(500, err);
			return res.send(204);
		});
	});
};

exports.deleteMembership = function(req, res) {
	var user = auth.getCurrentUser(req);
	Membership.findById(req.params.id, function(err, mem) {
		if (err) return res.send(500, err);
		if (!mem) return res.send(404);
		if(user[ID] != mem[CREATOR_ID]) {
			return res.send(401, {error: "Only the inviting user can delete an organization membership."});
		}
		Membership.findByIdAndRemove(req.params.id, function(err, obj) {
			if (err) return res.send(500, err);
			return res.send(204);
		});
	});
};

exports.showMembership = function(req, res, next) {
	var memId = req.params.id;
	if(!memId) return next(404);
	var user = auth.getCurrentUser(req);
	Membership.findById(memId, function(err, mem) {
		if (err) return res.send(500, err);
		var orgId = mem[ORGANIZATION_ID];
		/* check permission */
		if(!user.hasOrganization(orgId) && !isUserMember(user, mem)) {
			return next(401);
		}
		res.json(mem);
	});
};

var isUserMember = function(user, membership) {
	return membership[MEMBER] == user[EMAIL] || 
			membership[MEMBER] == user[ID];
}

exports.listMemberships = function(req, res, next) {
	var orgId = req.params.id;
	if(!orgId) return next(404);
	var user = auth.getCurrentUser(req);
	/* check permission */
	var userHasOrg = user.hasOrganization(orgId);
	var query = {};
	query[ORGANIZATION_ID] = orgId;
	var result = [];
	Membership.find(query, function(err, list) {
		if (err) return res.send(500, err);
		list.forEach(function(mem) {
			if(userHasOrg || isUserMember(user, mem)) {
				result.push(mem);
			}
		});
		if(!userHasOrg && result.length <= 0) {
			return res.status(401).send();
		}
		res.json(result);
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
					existingMem.member != user[ID] &&
					existingMem[CREATOR_ID] != user[ID]) {
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

var findOrg = function(id) {
	return new Promise(function (resolve, reject) {
		Organization.findById(id, function(err, org) {
			if (err)
				return next(err);
			resolve(org);
		});
	});
};

var findOrCreateMembership = function(mem) {
	/* check for existing invite */
	return new Promise(function (resolve, reject) {
		Membership.find(mem, function(err, list) {
			if (err)
				return reject(err);
			if (!list || !list.length) {
				/* save new */
				var newMem = new Membership(mem);
				newMem[STATUS] = STATUS_PENDING;
				newMem[CREATION_DATE] = new Date();
				newMem.save(function(err, savedMem) {
					/* set the 'new' flag */
					savedMem._isNew = true;
					resolve(savedMem);
				});
			} else {
				/* return existing */
				var memExist = list[0];
				resolve(memExist);
			}
		});
	});
};

var findUser = function(req, userId) {
	return new Promise(function (resolve, reject) {
		var query = {};
		if(userId.indexOf("@") >= 0) {
			query[EMAIL] = userId;
		} else {
			query[ID] = userId;
		}
		riox.user(query, {
			callback: function(user) {
				resolve(user);
			},
			headers: req.headers
		}, function(error) {
			reject(error);
		});
	});
};

exports.invite = function(req, res, next) {
	var user = auth.getCurrentUser(req);
	var inv = req.body;
	inv[CREATOR_ID] = user[ID];

	/* cannot invite yourself */
	if(user[ID] == inv[MEMBER]) {
		res.status(400).json({error: "You cannot invite yourself to this organization. Please choose a different user."});
		return;
	}

	var state = {};

	var findMem = function(org) {
		state.org = org;
		var query = {};
		query[ORGANIZATION_ID] = org[ID];
		query[MEMBER] = inv[MEMBER];
		query[CREATOR_ID] = inv[CREATOR_ID];
		return findOrCreateMembership(query);
	};
	var findInvitee = function(mem) {
		state.mem = mem;
		if(state.mem._isNew) {
			return findUser(req, inv[MEMBER]);
		}
	};
	var notify = function(invitee) {
		if(state.mem._isNew) {
			createNotification(req, TYPE_INVITE, state.org, state.mem);
			email.sendInvitationMail(user, invitee, state.mem, state.org);
		}
		res.json(state.mem);
	};
	var error = function(err) {
		return next(err);
	};

	/* start promise chain */
	findOrg(inv[ORGANIZATION_ID]).
	then(findMem, error).
	then(findInvitee, error).
	then(notify, error);

};

/* HELPER METHODS */

var createNotification = function (req, type, org, mem) {
	var notif = {};
	notif[TYPE] = type;
	if (type == TYPE_INVITE) {
		notif[TEXT] = "You have been invited to join the organization '" + org[NAME] + "'";
		notif[RECIPIENT_ID] = mem[MEMBER];
	}
	notif[STATUS] = STATUS_UNREAD;
	notif[PARAMS] = {};
	notif[PARAMS][ORGANIZATION_ID] = org[ID];
	notif[PARAMS][INVITER_ID] = mem[CREATOR_ID];
	riox.add.notification(notif, {
		headers: req.headers
	});
} 

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
			/* make sure we have a domain name */
			if(!newObj[DOMAIN_NAME]) {
				newObj[DOMAIN_NAME] = util.genShortUUID();
			}

			var newObj = new Organization(newObj);
			newObj.save(function(err, obj) {
				if (err)
					return errorCallback(err);
				callback(obj);
			});
		}
	});
}
