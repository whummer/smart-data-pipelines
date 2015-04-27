'use strict';

var Organization = require('./organization.model');
var auth = require('riox-services-base/lib/auth/auth.service');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');

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
	newOrg["creator-id"] = user.id;
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
	// check if this is the org's owner
	var query = {_id: orgId};
	Organization.find(query, function(err, list) {
		if (err)
			return next(err);
		if (!list || !list.length)
			return res.send(404);
		if (list[0]["creator-id"] != user.id)
			return res.send(401);
		obj.save(orgId, function(err, obj) {
			if (err)
				return validationError(res, err);
			res.json(obj);
		});
	});
};

exports.getOwn = function(req, res, next) {
	var user = auth.getCurrentUser(req);
	var query = {"creator-id": user.id};
	Organization.find(query, function(err, obj) {
		if (err)
			return next(err);
		if (obj.length) {
			res.json(obj[0]);
		} else {
			var newObj = new Organization({
				"name": "Default Organization",
				"creator-id": user.id
			});
			newObj.save(function(err, obj) {
				if (err)
					return validationError(res, err);
				res.json(obj);
			});
		}
	});
};

exports.show = function(req, res, next) {
	var id = req.params.id;
	var query = {_id: id};
	Organization.find(query, function(err, obj) {
		if (err)
			return next(err);
		if (!obj || !obj.length)
			return res.send(401);
		res.json(obj[0]);
	});
};

exports.destroy = function(req, res) {
	Organization.findByIdAndRemove(req.params.id, function(err, obj) {
		if (err)
			return res.send(500, err);
		return res.send(204);
	});
};
