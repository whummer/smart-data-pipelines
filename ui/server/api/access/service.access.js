'use strict';

var StreamAccess = require('./streamaccess.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');
var auth = require('../../auth/auth.service');


function read(query, req, res, next) {
	StreamAccess.findOne(query, function(result) {
		if(result) {
			res.send(result);
		} else {
			next(404);
		}
	});
}

exports.index = function(req, res, next) {
	var query = {};
	var user = auth.getCurrentUser();
	StreamAccess.find(query, function(result) {
		console.log("index", result);
		res.json(result);
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
	//var access = JSON.parse(req.body);
	var access = req.body;
	console.log("req.user", req.user);
	access.requestorId = req.user.id;
	StreamAccess.create(access, function(access) {
		res.json(200, access);
	});
}
 