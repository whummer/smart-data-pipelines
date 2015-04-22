'use strict';

var DataStream = require('./datastream.model');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var accessServiceAPI = require('_/api/access.client');
var auth = require('_/auth/auth.service');
var rabbitmq = require('./rabbitmq.service');
var springxd = require('./springxd.service');
var portfinder = require('portfinder');

var validationError = function (res, err) {
	return res.json(422, err);
};

function list(query, req, res) {
	DataStream.find(query, function (err, list) {
		if (err)
			return res.send(500, err);
//		console.log("list consumed", query, list);
		res.json(200, list);
	});
}

exports.index = function (req, res) {
	return list({}, req, res);
};

exports.listProvided = function (req, res) {
	var user = auth.getCurrentUser(req);
	var query = {ownerId: user.id};
	query = {}; // TODO remove! (testing only)
	return list(query, req, res);
};

exports.listConsumed = function (req, res) {
	var user = auth.getCurrentUser(req);
	accessServiceAPI.list(null, req, function (data, response) {
		var ids = [];
		data.forEach(function (el) {
			ids.push(el.streamId);
		});
		var query = {_id: {$in: ids}};
		return list(query, req, res);
	});
};

exports.create = function (req, res, next) {
	var dataStream = new DataStream(req.body);

	if (dataStream['sink-config'].connector != "http") {
		res.json(500, {"description": "Unsupported Connector-Type. Only HTTP is supported at the moment"});
		next();
	}

	dataStream.save(function (err, obj) {
		if (err)
			return validationError(res, err);

		res.json(obj);

		// create the rabbitmq exchage in the background
		var exchangeId = createExchangeId(dataStream);
		rabbitmq.createExchange(exchangeId);

		// create the SpringXD stream in the background
		var port = 6666;
		portfinder.getPort(function (error, freePort) {
			if (error) {
				console.log("Cannot find unused port: ", error);
				return;
			}

			var streamDefinition = "http --port=" + freePort + "| rabbit --exchange='" + exchangeId + "'\"";
			var streamId = exchangeId;
			springxd.createStream(streamId, streamDefinition);
		});
	});
};

// todo move this somewhere else
function createExchangeId(dataStream) {
	return dataStream._id;
}

exports.update = function (req, res) {
	var obj = new DataStream(req.body);
	obj.save(req.params.id, function (err, obj) {
		if (err)
			return validationError(res, err);
		res.json(obj);
	});
};

exports.show = function (req, res, next) {
	var id = req.params.id;

	DataStream.findById(id, function (err, obj) {
		if (err)
			return next(err);
		if (!obj)
			return res.send(404);
		//console.log("stream", obj);
		res.json(obj);
	});
};

exports.destroy = function (req, res) {
	DataStream.findByIdAndRemove(req.params.id, function (err, obj) {
		if (err)
			return res.send(500, err);
		return res.send(204);
	});
};
