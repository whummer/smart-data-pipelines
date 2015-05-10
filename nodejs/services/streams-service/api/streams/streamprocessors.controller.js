'use strict';

var StreamProcessor = require('./streamprocessor.model.js');
var passport = require('passport');
var auth = require('riox-services-base/lib/auth/auth.service');
var riox = require('riox-shared/lib/api/riox-api');
var containers = require('riox-services-base/lib/util/containers.util');
var springxd = require('riox-services-base/lib/util/springxd.util');
var errors = require('riox-services-base/lib/util/errors');

var log = global.log;

//
// route implementations
//
function list(query, req, res) {
	log.debug("Listing stream-processors");
	StreamProcessor.find(query, function (err, list) {
		if (err) {
			return next(errors.InternalError("Cannot list stream-processors", err));
		}

		res.json(200, list);
	});
}

exports.indexStreamProcessor = function (req, res) {
	return list({}, req, res);
};

exports.createStreamProcessor = function (req, res, next) {
	log.debug("Creating stream-processor: ", req.body);
	var streamProcessor = new StreamProcessor(req.body);

	streamProcessor.save(function (err, obj) {
		if (err) {
			return validationError(err, next);
		}

		res.json(200, obj);
	});
};

exports.applyByStream = function (stream, callback, errorCallback) {
	if (!stream[SOURCE_ID] || !stream[SINK_ID]) {
		return errorCallback("Please provide a valid stream with " + SOURCE_ID + " and " + SINK_ID);
	}

	var cfg = {};

	var xdStreamId = "processors-" + stream["id"];

	var findContainers = function (resolve, reject) {
		containers.getContainersIPs(["zookeeper", "kafka"], resolve);
	};

	var findStream = function (resolve, reject) {
		springxd.findStream(xdStreamId, resolve, reject);
	};

	var createStream = function (resolve, reject) {

		// create the SpringXD stream
		var port = 9001;
		var sourceTopic = "producer-" + stream[SOURCE_ID];
		var sinkTopic = "consumer-" + stream[SINK_ID];
		var mimeType = "text/plain";
		var streamDefinition = "k1: kafka --zkconnect=" + cfg.zookeeper + ":2181 --topic=" + sourceTopic + " --outputType=" + mimeType +
			" | transform | " +

				// TODO add analytics processors here

			"k2: kafka --topic=" + sinkTopic + " --brokerList=" + cfg.kafka + ":9092";

		springxd.createStream(xdStreamId, streamDefinition, function (stream) {
			log.debug("processors stream " + xdStreamId + " created!");
			resolve(stream);
		});

	};

	new Promise(findContainers).
		then(function (conts) {
			cfg.zookeeper = conts[0];
			cfg.kafka = conts[1];
			if (!cfg.zookeeper) {
				return errorCallback("Zookeeper instance not found.");
			}
			if (!cfg.kafka) {
				return errorCallback("Kafka instance not found.");
			}
			return new Promise(findStream);
		}).
		then(function (stream) {
			return stream ? stream : new Promise(createStream);
		}).
		then(function (stream) {
			cfg.stream = stream;
			callback({result: stream});
		});
};

exports.updateStreamProcessor = function (req, res) {
	var streamProcessor = new StreamProcessor(req.body);
	streamProcessor.save(req.params.id, function (err, obj) {
		if (err) {
			return validationError(err, next);
		}

		res.json(obj);
	});
};

exports.showStreamProcessor = function (req, res, next) {
	var id = req.params.id;
	StreamProcessor.findById(id, function (err, obj) {
		if (err) {
			return next(errors.InternalError("Cannot find stream-processor with ID " + id, err));
		}

		if (!obj) {
			return next(errors.NotFoundError("Cannot find stream-processor with ID " + id));
		}

		res.json(obj);
	});
};

exports.destroyStreamProcessor = function (req, res) {
	var streamId = req.params.id;
	StreamProcessor.findByIdAndRemove(streamId, function (err) {
		if (err) {
			return next(errors.InternalError("Cannot remove stream with ID " + streamId, err));
		}

		return res.send(204);
	});
};


//
// helpers
//
var validationError = function (err, next) {
	return next(errors.UnprocessableEntity("You passed a broken object", err));
};
