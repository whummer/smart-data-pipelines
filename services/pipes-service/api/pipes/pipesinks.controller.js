'use strict';

var PipeSink = require('./pipesink.model.js');
var passport = require('passport');
var mongoose = global.mongoose || require('mongoose');
var auth = require('riox-services-base/lib/auth/auth.service');
var riox = require('riox-shared/lib/api/riox-api');
var springxd = require('riox-services-base/lib/util/springxd.util');
var errors = require('riox-services-base/lib/util/errors');

var log = global.log || require('winston');

function list(query, req, res, next) {
	PipeSink.find(query, function (err, list) {
		if (err) {
			return next(errors.InternalError("Cannot list sinks", err));
		}
		list.forEach(function(sink) {
			/* set endpoint info */
			setEndpoint(sink);
		});
		res.json(200, list);
	});
}

exports.index = function (req, res, next) {
	return list({}, req, res, next);
};

exports.create = function (req, res, next) {
	var sink = req.body;
	if (!sink[ORGANIZATION_ID]) {
		console.log(sink);
		return validationError("Please provide a valid " + ORGANIZATION_ID + " for this sink.", next);
	}
	// TODO check if ORGANIZATION_ID belongs to calling user!

	/* set endpoint info */
	setEndpoint(sink);

	var obj = new PipeSink(sink);
	obj.save(function (err, obj) {
		if (err) {
			return validationError(err, next);
		}

		res.json(obj);
	});
};

exports.update = function (req, res, next) {
	var obj = new PipeSink(req.body);
	obj.save(req.params.id, function (err, obj) {
		if (err) {
			return validationError(err, next);
		}

		res.json(obj);
	});
};

exports.show = function (req, res, next) {
	var id = req.params.id;

	PipeSink.findById(id, function (err, obj) {
		if (err || !obj) {
			return next(errors.NotFoundError("Cannot find sink: " + id))
		}

		res.json(obj);
	});
};

exports.destroy = function (req, res, next) {
	PipeSink.findByIdAndRemove(req.params.id, function (err, obj) {
		if (err) {
			return next(errors.InternalError("Cannot destroy sink", err));
		}

		return res.send(204);
	});
};

var applyBySinkId = exports.applyBySinkId = function (id, callback, errorCallback) {
	PipeSink.findById(id, function (err, obj) {
		if (err || !obj) {
			return next(errors.NotFoundError("Cannot find sink with ID " + id));
		}

		applyBySink(obj,

			function (result) {
				callback(result);
			},

			errorCallback
		);
	});
};

var applyBySink = exports.applyBySink = function(sink, callback, errorCallback) {
	if(!sink[ID] || !sink[ORGANIZATION_ID]) {
		return errorCallback("Please provide valid sink id and organization id");
	}

	var xdId = "consumer-" + sink.id;
	var topicName = "consumer-" + sink.id;

	var cfg = {};

	var findStream = function(resolve, reject) {
		springxd.findStream(xdId, resolve, reject);
	};

	var createStream = function(resolve, reject) {

		// create the SpringXD stream
		var port = config.xdcontainer.outbound.port;
		var path = "/" + sink[ORGANIZATION_ID] + "/" + sink.id;
//		var mimeType = "application/x-xd-tuple";
//		var mimeType = "application/json";
		var mimeType = "text/plain";
		var streamDefinition = "kafka --zkconnect=" +
		    config.zookeeper.hostname + ":" + config.zookeeper.port +
				" --topic=" + topicName + " --outputType=" + mimeType +
				" | " + "websocket --port=" + port + " --path=" + path;

		springxd.createStream(xdId, streamDefinition, function (stream) {
			log.info("consumer stream " + xdId + " created!");
			resolve(stream);
		}, errorCallback);

	};

	new Promise(findStream).
	then(function(stream) {
		return stream ? stream : new Promise(createStream);
	}).
	then(function(stream) {
		cfg.stream = stream;
		callback({ result: stream });
	});

};


var setEndpoint = function(source) {
	var host = "TODO.riox"; // TODO!
	source[ENDPOINT] = "ws://" + host + ":9001/" +
		source[ORGANIZATION_ID] + "/" + source[ID];
}

//
// helpers
//
var validationError = function (err, next) {
	return next(errors.UnprocessableEntity("You passed a broken object", err));
};
