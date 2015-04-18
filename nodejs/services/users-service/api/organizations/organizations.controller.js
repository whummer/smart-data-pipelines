'use strict';

var Organization = require('./organization.model');
var config = require('_/config/environment');
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
	var newObj = new Organization(req.body);
	newObj.save(function(err, obj) {
		if (err)
			return validationError(res, err);
		res.json(obj);
	});
};

exports.update = function(req, res) {
	var obj = new Organization(req.body);
	obj.save(req.params.id, function(err, obj) {
		if (err)
			return validationError(res, err);
		res.json(obj);
	});
};

exports.show = function(req, res, next) {
	var id = req.params.id;
	var query = {id: id};
	Organization.find(query, function(err, obj) {
		if (err)
			return next(err);
		if (!obj)
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
