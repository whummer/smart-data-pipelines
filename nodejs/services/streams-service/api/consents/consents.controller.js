'use strict';

var StreamConsent = require('./accessconsent.model');
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
				crit1[PROVIDER_ID] = org.id;
				crit2[REQUESTOR_ID] = org.id;
				query.$or.push(crit1);
				query.$or.push(crit2);
			});

			StreamConsent.find(query, function(err, list) {
				if (err)
					return res.send(500, err);
				res.json(200, list);
			});
		}
	});
};

exports.show = function(req, res, next) {
	var id = req.params.id;

	StreamConsent.findById(id, function(err, obj) {
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
	StreamConsent.findById(id, function(err, obj) {
		if (err) return next(err);
		if (!obj) return res.send(404);

		/* check if user is permitted */
		var user = auth.getCurrentUser(req);
		if(user[ID] != obj[REQUESTOR_ID] && !user.hasOrganization(obj[REQUESTOR_ID])) {
			return res.send(401);
		}
		StreamConsent.remove(id, function(err, obj) {
			if (err) return res.send(500, err);
			return res.send(204);
		});
	});

};

exports.create = function(req, res, next) {
	var user = auth.getCurrentUser(req);
	var consent = req.body;

	var sourceId = consent[SOURCE_ID];
	if(!sourceId) {
		res.json(422, {error: SOURCE_ID + " is required"});
		return;
	}
	if(!consent[REQUESTOR_ID]) {
		log.error(REQUESTOR_ID + " is missing");
		res.json(422, {error: REQUESTOR_ID + " is required"});
		return;
	}
	if(consent[REQUESTOR_ID] != user.id) {
		if(!user.hasOrganization(consent[REQUESTOR_ID])) {
			return res.json(401, {error: "Invalid " + REQUESTOR_ID});
		}
	}
	riox.streams.source(sourceId, {
		callback: function(source) {
			consent[CREATED] = consent[CHANGED] = new Date().getTime();
			consent[PROVIDER_ID] = source[ORGANIZATION_ID];
			consent[STATUS] = STATUS_REQUESTED;
			StreamConsent.create(consent, function() {
				res.json(200, consent);
			});
		}, headers: req.headers
	}, function() {
		res.json(404, {message: "Cannot find entity with ID " + sourceId });
	});
};


exports.enableConsent = function(req, res, next) {
	updatePermission(req, res, true);
};

exports.disableConsent = function(req, res, next) {
	updatePermission(req, res, false);
};

var updatePermission = function(req, res, allowed) {
	var user = auth.getCurrentUser(req);
	var id = req.params.id;
	if(!id) return;
	AccessConsent.findById(id, function(err, obj) {
		if (err)
			return next(err);
		if (!obj)
			return res.send(404);
		obj[STATUS] = allowed ? STATUS_PERMITTED : STATUS_DENIED;
		obj.save(function(err, obj) {
			createNotification(req, TYPE_CONSENT_UPDATE, obj);
			res.json(obj);
		});
	});
};

/* HELPER METHODS */

var createNotification = function(req, type, consent) {
	var notif = {};
	notif[TYPE] = type;
	if(type == TYPE_CONSENT_UPDATE) {
		notif[TEXT] = "User updated consent to access data in stream source #" + consent[SOURCE_ID];
		notif[RECIPIENT_ID] = consent[PROVIDER_ID];
	}
	notif[STATUS] = STATUS_UNREAD;
	notif[PARAMS] = {};
	notif[PARAMS][SOURCE_ID] = consent[SOURCE_ID];
	notif[PARAMS][REQUESTOR_ID] = consent[REQUESTOR_ID];
	riox.add.notification(notif, {
		headers: req.headers
	});
}
