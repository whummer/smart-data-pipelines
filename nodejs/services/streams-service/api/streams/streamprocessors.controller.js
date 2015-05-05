'use strict';

var StreamProcessor = require('./streamprocessor.model.js');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var auth = require('riox-services-base/lib/auth/auth.service');
var riox = require('riox-shared/lib/api/riox-api');
var portfinder = require('portfinder');
var containers = require('riox-services-base/lib/util/containers.util');
var springxd = require('riox-services-base/lib/util/springxd.util');

var validationError = function (res, err) {
	return res.json(422, err);
};

function list(query, req, res) {
	StreamProcessor.find(query, function (err, list) {
		if (err)
			return res.send(500, err);
		res.json(200, list);
	});
}

exports.indexStreamProcessor = function (req, res) {
	return list({}, req, res);
};

exports.createStreamProcessor = function (req, res, next) {
	var streamProcessor = new StreamProcessor(req.body);

	streamProcessor.save(function (err, obj) {
		if (err)
			return validationError(res, err);
		res.json(obj);
	});
};

exports.applyByStream = function(stream, callback, errorCallback) {
	if(!stream[SOURCE_ID] || !stream[SINK_ID]) {
		return errorCallback("Please provide a valid stream with " + SOURCE_ID + " and " + SINK_ID);
	}

	var cfg = {};

	var xdStreamId = "processors-" + stream["id"];

	var findContainers = function(resolve, reject) {
		containers.getContainersIPs(["zookeeper", "kafka"], resolve);
	};

	var findStream = function(resolve, reject) {
		springxd.findStream(xdStreamId, resolve, reject);
	};

	var createStream = function(resolve, reject) {

		// create the SpringXD stream
		var port = 9001;
		var sourceTopic = "producer-" + stream[SOURCE_ID];
		var sinkTopic = "consumer-" + stream[SINK_ID];
		var mimeType = "text/plain";
		var streamDefinition = "k1: kafka --zkconnect=" + cfg.zookeeper + ":2181 --topic=" + sourceTopic + " --outputType=" + mimeType +
				" | transform | " +

				// TODO add analytics processors here

				"k2: kafka --topic=" + sinkTopic + " --brokerList=" + cfg.kafka + ":9092";

		springxd.createStream(xdStreamId, streamDefinition, function(stream) {
			console.log("processors stream " + xdStreamId + " created!");
			resolve(stream);
		});

	};

	new Promise(findContainers).
	then(function(conts) {
		cfg.zookeeper = conts[0];
		cfg.kafka = conts[1];
		if(!cfg.zookeeper) {
			return errorCallback("Zookeeper instance not found.");
		}
		if(!cfg.kafka) {
			return errorCallback("Kafka instance not found.");
		}
		return new Promise(findStream);
	}).
	then(function(stream) {
		return stream ? stream : new Promise(createStream);
	}).
	then(function(stream) {
		cfg.stream = stream;
		callback({ result: stream });
	});
};

exports.updateStreamProcessor = function (req, res) {
  var streamProcessor = new StreamProcessor(req.body);
  streamProcessor.save(req.params.id, function (err, obj) {
    if (err)
      return validationError(res, err);
    res.json(obj);
  });
};

exports.showStreamProcessor = function (req, res, next) {
  var id = req.params.id;

  StreamProcessor.findById(id, function (err, obj) {
    if (err)
      return next(err);
    if (!obj)
      return res.send(404);
    //console.log("stream", obj);
    res.json(obj);
  });
};

exports.destroyStreamProcessor = function (req, res) {
  StreamProcessor.findByIdAndRemove(req.params.id, function (err, obj) {
    if (err)
      return res.send(500, err);
    return res.send(204);
  });
};
