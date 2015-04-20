'use strict';

var StreamAccess = require('./streamaccess.model');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var auth = require('_/auth/auth.service');

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
	var user = auth.getCurrentUser(req);
	var query = {
			streamId: req.params.streamId,
			$or: 
				[
					{ownerId: user.id},
					{requestorId: user.id}
				]
	};
	return StreamAccess.find(query, function(err, obj) {
		if (err)
			return next(err);
		if (!obj)
			return res.send(404);
		//console.log("stream", obj);
		res.json(obj);
	});
}
exports.show = function(req, res, next) {
	var id = req.params.id;

	DataStream.findById(id, function(err, obj) {
		if (err)
			return next(err);
		if (!obj)
			return res.send(404);
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
 