'use strict';

var Organization = require('./organization.model');
var config = require('../../config/environment');
var passport = require('passport');
var jwt = require('jsonwebtoken');

var validationError = function(res, err) {
	return res.json(422, err);
};

exports.index = function(req, res) {
  Organization.find({}, function (err, list) {
	  if(!list || !list.length) {
		  list = demoData;
	  }
	  if(err) return res.send(500, err);
	  res.json(200, list);
  });
};

exports.create = function (req, res, next) {
	var newObj = new Organization(req.body);
	newObj.save(function(err, obj) {
		if (err) return validationError(res, err);
		res.json(obj);
	});
};

exports.show = function (req, res, next) {
	var id = req.params.id;

	Organization.findById(id, function (err, obj) {
		if (err) return next(err);
		if (!obj) return res.send(401);
		res.json(obj);
	});
};

exports.destroy = function(req, res) {
	Organization.findByIdAndRemove(req.params.id, function(err, obj) {
		if(err) return res.send(500, err);
		return res.send(204);
	});
};
