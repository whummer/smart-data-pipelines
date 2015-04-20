'use strict';

var StreamAccess = require('./streamaccess.model');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var auth = require('_/auth/auth.service');

function read(query, req, res, next) {
	StreamAccess.findOne(query, function(err, obj) {
		if (err)
			return next(err);
		if (!obj)
			return res.send(401);
		//console.log("stream", obj);
		res.json(obj);
	});
}

exports.index = function(req, res, next) {
	var user = auth.getCurrentUser(req);
	var query = { $or: 
		[
			{ownerId: user.id},
			{requestorId: user.id}
		]
	};
	StreamAccess.find(query, function(err, list) {
		if (err)
			return res.send(500, err);
		res.json(200, list);
	});
}
exports.getByStream = function(req, res, next) {
	var query = {streamId: req.params.streamId};
	console.log("getByStream", query);
	return read(query, req, res, next);
}
exports.show = function(req, res, next) {
	var id = req.params.id;

	DataStream.findById(id, function(err, obj) {
		if (err)
			return next(err);
		if (!obj)
			return res.send(401);
		res.json(obj);
	});
}

exports.destroy = function(req, res, next) {
	// TODO
}

exports.create = function(req, res, next) {
	var access = req.body;
	access.created = access.changed = new Date().getTime();
	var user = auth.getCurrentUser(req);
	access.requestorId = user.id;
	StreamAccess.create(access, function(access) {
		res.json(200, access);
	});
}
 