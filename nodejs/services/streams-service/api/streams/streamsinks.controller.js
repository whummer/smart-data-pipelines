'use strict';

var StreamSink = require('./streamsink.model.js');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var auth = require('riox-services-base/lib/auth/auth.service');
var riox = require('riox-shared/lib/api/riox-api');
var portfinder = require('portfinder');
var containers = require('riox-services-base/lib/util/containers.util');
var springxd = require('riox-services-base/lib/util/springxd.util');


var validationError = function (res, err) {
	return res.json(422, err);
};

function list(query, req, res) {
	StreamSink.find(query, function (err, list) {
		if (err)
			return res.send(500, err);
		res.json(200, list);
	});
}

exports.indexStreamSink = function (req, res) {
	return list({}, req, res);
};

exports.createStreamSink = function (req, res, next) {
	var streamSink = new StreamSink(req.body);

	streamSink.save(function (err, obj) {
		if (err)
			return validationError(res, err);
		res.json(obj);
	});
};

exports.updateStreamSink = function (req, res) {
  var streamSink = new StreamSink(req.body);
  streamSink.save(req.params.id, function (err, obj) {
    if (err)
      return validationError(res, err);
    res.json(obj);
  });
};

exports.showStreamSink = function (req, res, next) {
  var id = req.params.id;

  StreamSink.findById(id, function (err, obj) {
    if (err)
      return next(err);
    if (!obj)
      return res.send(404);
    //console.log("stream", obj);
    res.json(obj);
  });
};

exports.destroyStreamSink = function (req, res) {
  StreamSink.findByIdAndRemove(req.params.id, function (err, obj) {
    if (err)
      return res.send(500, err);
    return res.send(204);
  });
};

var applyByStreamSinkId = exports.applyByStreamSinkId = function(id, callback, errorCallback) {
	StreamSink.findById(id, function (err, obj) {
		if (err)
	    	return next(err);
		if (!obj)
			return res.send(404);
		applyByStreamSink(obj, function(result) {
			callback(result);
		}, errorCallback);
	});
};

var applyByStreamSink = exports.applyByStreamSink = function(sink, callback, errorCallback) {
	if(!sink.id || !sink[ORGANIZATION_ID]) {
		return errorCallback("Please provide valid id and organization id");
	}

	var xdStreamId = "consumer-" + sink.id;
	var topicName = "consumer-" + sink.id;

	var cfg = {};

	var findContainers = function(resolve, reject) {
		containers.getContainersIPs(["zookeeper", "kafka"], resolve);
	};

	var findStream = function(resolve, reject) {
		springxd.findStream(xdStreamId, resolve, reject);
	};

	var createStream = function(resolve, reject) {

		// create the SpringXD stream
		var port = 9001;
		var path = "/" + sink[ORGANIZATION_ID] + "/" + sink.id;
//		var mimeType = "application/x-xd-tuple";
//		var mimeType = "application/json";
		var mimeType = "text/plain";
		var streamDefinition = "kafka --zkconnect=" + cfg.zookeeper + ":2181 --topic=" + topicName + 
				" --outputType=" + mimeType + " | " + "websocket --port=" + port + " --path=" + path;

		springxd.createStream(xdStreamId, streamDefinition, function(stream) {
			console.log("consumer stream " + xdStreamId + " created!");
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
