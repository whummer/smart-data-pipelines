'use strict';

var StreamAccess = require('./stream.access');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');

function read(query, req, res, next) {
	StreamAccess.findOne(query, function(result) {
		if(result) {
			res.send(result);
		}
		next();
	});
}

exports.index = function(req, res, next) {
	var query = {};
	StreamAccess.find(query, function(result) {
		res.send(result);
		next();
	});
}
exports.getByStream = function(req, res, next) {
	var query = {streamId: req.params.id};
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
	var access = JSON.parse(req.body);
	StreamAccess.create(access, function(access) {
		res.send(access);
		next();
	});
}
 