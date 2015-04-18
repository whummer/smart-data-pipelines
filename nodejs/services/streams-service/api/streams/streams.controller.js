'use strict';

var DataStream = require('./datastream.model');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var accessServiceAPI = require('_/api/access.client');
var auth = require('_/auth/auth.service');


var validationError = function(res, err) {
	return res.json(422, err);
};

function list(query, req, res) {
	DataStream.find(query, function(err, list) {
		if (err)
			return res.send(500, err);
//		console.log("list consumed", query, list);
		res.json(200, list);
	});
}

exports.index = function(req, res) {
	return list({}, req, res);
};

exports.listProvided = function(req, res) {
	var user = auth.getCurrentUser(req);
	var query = {ownerId: user.id};
	return list(query, req, res);
};

exports.listConsumed = function(req, res) {
	var user = auth.getCurrentUser(req);
	accessServiceAPI.list(null, req, function(data,response) {
		var ids = [];
		data.forEach(function(el) {
			ids.push(el.streamId);
		});
		var query = {_id: { $in : ids } };
		return list(query, req, res);
	});
};

exports.create = function(req, res, next) {
	var newObj = new DataStream(req.body);
	newObj.save(function(err, obj) {
		if (err)
			return validationError(res, err);
		res.json(obj);
	});
};

exports.update = function(req, res) {
	var obj = new DataStream(req.body);
	obj.save(req.params.id, function(err, obj) {
		if (err)
			return validationError(res, err);
		res.json(obj);
	});
};

exports.show = function(req, res, next) {
	var id = req.params.id;

	DataStream.findById(id, function(err, obj) {
		if (err)
			return next(err);
		if (!obj)
			return res.send(404);
		//console.log("stream", obj);
		res.json(obj);
	});
};

exports.destroy = function(req, res) {
	DataStream.findByIdAndRemove(req.params.id, function(err, obj) {
		if (err)
			return res.send(500, err);
		return res.send(204);
	});
};
