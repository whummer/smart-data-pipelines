'use strict';

var StreamAccess = require('./stream.access');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var auth = require('_/auth/auth.service');

function read(query, req, res, next) {
	StreamAccess.findOne(query, function(result) {
		if(result) {
			res.send(result);
		}
		next();
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
	StreamAccess.find(query, function(result) {
		res.send(result);
		next();
	});
}
exports.getByStream = function(req, res, next) {
	var query = {streamId: req.params.streamId};
	return read(query, req, res, next);
}
exports.show = function(req, res, next) {
	var query = {_id: req.params.id};
	return read(query, req, res, next);
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
 