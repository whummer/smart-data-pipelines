'use strict';

var mongoose = global.mongoose || require('mongoose');
var Certificate = require('./certificate.model');
var util = require('riox-services-base/lib/util/util');
var auth = require('riox-services-base/lib/auth/auth.service');

var CERT_FILE = "cert-file";
var PK_FILE = "pk-file";

var validationError = function(res, err) {
	return res.json(422, err);
};

function list(query, req, res) {
	Certificate.find(query, function(err, list) {
		if (err)
			return res.send(500, err);
		res.json(200, list);
	});
}

exports.index = function(req, res) {
	return list({}, req, res);
};

exports.getOwn = function(req, res) {
	var user = auth.getCurrentUser(req);
	var query = {};
	query[CREATOR_ID] = user.id;
	return list(query, req, res);
};

exports.create = function(req, res, next) {
	var user = auth.getCurrentUser(req);
	var newOrg = req.body;
	newOrg[CREATOR_ID] = user.id;
	var newObj = new Certificate(newOrg);
	newObj.save(function(err, obj) {
		if (err)
			return validationError(res, err);
		res.json(obj);
	});
};

exports.update = function(req, res) {
	var obj = new Certificate(req.body);
	var user = auth.getCurrentUser(req);
	var orgId = req.params.id;
	// check if IDs match
	if(orgId != obj.id) {
		return validationError(res, err);
	}
	var query = {_id: orgId};
	Certificate.find(query, function(err, list) {
		if (err)
			return next(err);
		if (!list || !list.length)
			return res.send(404);
		var existing = list[0];
		// check if this is the org's owner
		if (existing[CREATOR_ID] != user.id)
			return res.send(401);
		/* copy info to existing entity */
		existing[NAME] = obj[NAME];
		existing[CERT_FILE] = obj[CERT_FILE];
		existing[PK_FILE] = obj[PK_FILE];

		existing.save(function(err, obj) {
			if (err)
				return validationError(res, err);
			res.json(obj);
		});
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
	Certificate.findByIdAndRemove(req.params.id, function(err, obj) {
		if (err)
			return res.send(500, err);
		return res.send(204);
	});
};

/* HELPER METHODS */

var findSingle = function(id, callback, errorCallback) {
	var query = {_id: id};
	Certificate.find(query, function(err, obj) {
		if (err)
			return errorCallback(err);
		if (!obj || !obj.length)
			return errorCallback(404);
		callback(obj[0]);
	});
}
