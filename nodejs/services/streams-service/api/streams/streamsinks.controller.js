'use strict';

var StreamSink = require('./streamsink.model.js');
var passport = require('passport');
var mongoose = require('mongoose');
var auth = require('riox-services-base/lib/auth/auth.service');
var riox = require('riox-shared/lib/api/riox-api');
var springxd = require('riox-services-base/lib/util/springxd.util');
var errors = require('riox-services-base/lib/util/errors');

var log = global.log || require('winston');

function list(query, req, res, next) {
	StreamSink.find(query, function (err, list) {
		if (err) {
			return next(errors.InternalError("Cannot list stream sinks", err));
		}
		list.forEach(function(sink) {
			/* set endpoint info */
			setEndpoint(sink);
		});
		res.json(200, list);
	});
}

exports.indexStreamSink = function (req, res, next) {
	return list({}, req, res, next);
};

exports.createStreamSink = function (req, res, next) {
	var sink = req.body;
	if (!sink[ORGANIZATION_ID]) {
		console.log(sink);
		return validationError("Please provide a valid " + ORGANIZATION_ID + " for this sink.", next);
	}
	// TODO check if ORGANIZATION_ID belongs to calling user!

	/* set endpoint info */
	setEndpoint(sink);

	var streamSink = new StreamSink(sink);
	streamSink.save(function (err, obj) {
		if (err) {
			return validationError(err, next);
		}

		res.json(obj);
	});
};

exports.updateStreamSink = function (req, res, next) {
	var streamSink = new StreamSink(req.body);
	streamSink.save(req.params.id, function (err, obj) {
		if (err) {
			return validationError(err, next);
		}

		res.json(obj);
	});
};

exports.showStreamSink = function (req, res, next) {
	var id = req.params.id;

	StreamSink.findById(id, function (err, obj) {
		if (err) {
			return next(errors.InternalError("Cannot lookup stream sink", err));
		}

		if (!obj) {
			return next(errors.NotFoundError("No such stream-sink: " + id))
		}

		res.json(obj);
	});
};

exports.destroyStreamSink = function (req, res, next) {
	StreamSink.findByIdAndRemove(req.params.id, function (err, obj) {
		if (err) {
			return next(errors.InternalError("Cannot destroy stream-sink", err));
		}

		return res.send(204);
	});
};

var applyByStreamSinkId = exports.applyByStreamSinkId = function (id, callback, errorCallback) {
	StreamSink.findById(id, function (err, obj) {
		if (err) {
			return next(errors.InternalError("Cannot apply stream-sink", err));
		}
		if (!obj) {
			return next(errors.NotFoundError("Cannot find stream-sink with ID " + id));
		}

		applyByStreamSink(obj,

			function (result) {
				callback(result);
			},

			errorCallback
		);
	});
};

var applyByStreamSink = exports.applyByStreamSink = function(sink, callback, errorCallback) {
	log.debug("Applying stream-sink: ", sink[ID]);
	if(!sink[ID] || !sink[ORGANIZATION_ID]) {
		return errorCallback("Please provide valid stream sink id and organization id");
	}

	var xdStreamId = "consumer-" + sink.id;
	var topicName = "consumer-" + sink.id;

	var cfg = {};

	var findStream = function(resolve, reject) {
		springxd.findStream(xdStreamId, resolve, reject);
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

		springxd.createStream(xdStreamId, streamDefinition, function (stream) {
			log.info("consumer stream " + xdStreamId + " created!");
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
