'use strict';

var mongoose = global.mongoose || require('mongoose');
var Notification = require('./notification.model');
var auth = require('riox-services-base/lib/auth/auth.service');

var validationError = function(res, err) {
	return res.json(422, err);
};

function list(query, req, res) {
	Notification.find(query, function(err, list) {
		if (err)
			return res.status(500).send({error: err});
		res.json(list);
		res.end();
	});
};

exports.index = function(req, res, next) {
	var user = auth.getCurrentUser(req);
	var query = {};
	query[STATUS] = {"$not": { "$eq": STATUS_DELETED} };
	query[RECIPIENT_ID] = user[ID];
	return list(query, req, res);
};

exports.create = function(req, res, next) {
	var user = auth.getCurrentUser(req);
	var newObj = req.body;
	if(!newObj[STATUS]) {
		newObj[STATUS] = STATUS_UNREAD;
	}
	if(!newObj[CREATOR_ID]) {
		newObj[CREATOR_ID] = user.id;
	}
	if(!newObj[CREATION_DATE]) {
		newObj[CREATION_DATE] = new Date();
	}
	var newObj = new Notification(newObj);
	newObj.save(function(err, obj) {
		if (err)
			return validationError(res, err);
		res.json(obj);
	});
};

exports.update = function(req, res) {
	var obj = new Notification(req.body);
	var user = auth.getCurrentUser(req);
	var query = {_id: obj.id};
	Notification.findById(query, function(err, existing) {
		if (err)
			return next(err);
		if (!existing)
			return res.send(404);
		if (existing[CREATOR_ID] != user.id) {
			// TODO: check if this user is permitted
		}
		/* copy info to existing entity */
		existing[STATUS] = obj[STATUS];
		/* save changes */
		existing.save(function(err, obj) {
			if (err)
				return validationError(res, err);
			res.json(obj);
		});
	});
};

exports.show = function(req, res, next) {
	var id = req.params.id;
	Notification.findById(req.params.id, function(err, obj) {
		if (err)
			return res.send(500, err);
		return res.json(obj);
	});
};

exports.delete = function(req, res) {
	Notification.findById(req.params.id, function(err, obj) {
		if (err)
			return res.send(500, err);
		if (!obj)
			return res.send(404, err);
		obj[STATUS] = STATUS_DELETED;
		obj.save(function() {
			return res.send(204);
		})
	});
};
