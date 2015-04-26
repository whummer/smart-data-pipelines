'use strict';

var DataStream = require('./datastream.model');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var auth = require('riox-services-base/lib/auth/auth.service');
var riox = require('riox-services-base/../../web-ui/lib/app/components/js/riox-api'); // TODO fix path
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
	var query = {};
	riox.streams.consumed(query, {
		callback: function (data, response) {
			console.log("data", data);
			var ids = [];
			data.forEach(function (el) {
				ids.push(el.streamId);
			});
			var query = {_id: {$in: ids}};
			return list(query, req, res);
		},
		headers: req.headers
	});
};

exports.create = function (req, res, next) {
	var dataStream = new DataStream(req.body);

	if (dataStream['sink-config'].connector != "http") {
		res.json(500, {"description": "Unsupported Connector-Type. Only HTTP is supported at the moment"});
		next();
		return;
	}

	dataStream.save(function (err, obj) {
		if (err)
			return validationError(res, err);

		res.json(obj);

		// todo handle rollbacks accordingly (ie.e when exchange cannot be created, rollback the stream creation)

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

			var streamDefinition = "http --port=" + freePort + "| rabbit --vhost=riox --exchange=" + exchangeId;
			var streamId = dataStream.name + '_' + exchangeId;
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
