'use strict';

var StreamSource = require('./streamsource.model.js');
var passport = require('passport');
var auth = require('riox-services-base/lib/auth/auth.service');
var riox = require('riox-shared/lib/api/riox-api');
var springxd = require('riox-services-base/lib/util/springxd.util');
var kafka = require('riox-services-base/lib/util/kafka.util');
var containers = require('riox-services-base/lib/util/containers.util');
var portfinder = require('portfinder');
var path = require('path');
var log = require('winston');

var validationError = function (res, err) {
	return res.json(422, err);
};

function list(query, req, res) {
	StreamSource.find(query, function (err, list) {
		if (err)
			return res.send(500, err);
		res.json(200, list);
	});
}

exports.indexStreamSource = function (req, res) {
	var query = {};
	return list(query, req, res);
};

exports.listProvided = function (req, res) {
  var user = auth.getCurrentUser(req);
  var query = {ownerId: user.id};
  query[OWNER_ID] = user.id;
  query = {}; // TODO remove! (testing only)
  return list(query, req, res);
};

exports.listConsumed = function (req, res) {
  var user = auth.getCurrentUser(req);
  var query = {};
  riox.access(query, {
    callback: function (data, response) {
      var ids = [];
      data.forEach(function (el) {
        ids.push(el[SOURCE_ID]);
      });
      var query = {_id: {$in: ids}};
      return list(query, req, res);
    },
    headers: req.headers
  });
};

exports.createStreamSource = function (req, res, next) {
  var streamSource = new StreamSource(req.body);

	if (!streamSource.connector || streamSource.connector.type != "http") {
		return validationError(res, {"description": "Unsupported Connector-Type. Only HTTP is supported at the moment"});
	}
	if (!streamSource[ORGANIZATION_ID]) {
		return validationError(res, {"description": "Please provide a valid " + ORGANIZATION_ID + " for this source."});
	}
	if (!streamSource[PERMIT_MODE]) {
		return validationError(res, {"description": "Please provide a valid " + PERMIT_MODE + " for this source."});
	}

	streamSource.save(function (err, obj) {
		if (err)
			return validationError(res, err);
		res.json(obj);
	});
};

exports.applyStreamSource = function (req, res, next) {
	var sourceId = req.params.id;
	applyByStreamSourceId(sourceId, function(result) {
		res.json(result);
	}, function(result) {
		res.json(500, result);
	});
};

var applyByStreamSourceId = exports.applyByStreamSourceId = function(id, callback, errorCallback) {
	StreamSource.findById(id, function (err, obj) {
		if (err)
	    	return next(err);
		if (!obj)
			return errorCallback(404);
		applyByStreamSource(obj, function(result, errorCallback) {
			callback(result);
		}, errorCallback);
	});
};

var applyByStreamSource = exports.applyByStreamSource = function(source, callback, errorCallback) {
	if(!source.id || !source[ORGANIZATION_ID]) {
		return errorCallback("Please provide valid source id and source organization id");
	}

	var xdStreamId = "producer-" + source.id;
	var topicName = "producer-" + source.id;

	var cfg = {};

	var findContainers = function(resolve, reject) {
    console.log("Trying to find container")
		containers.getContainersIPs(["zookeeper", "kafka", "springxd-admin"], resolve, reject);
	};

	var findStream = function(resolve, reject) {
		springxd.findStream(xdStreamId, resolve, reject);
	};

	var createStream = function(resolve, reject) {
		// create the SpringXD stream
    console.log("About to create stream:");
		var port = 9000;
		var path = "/" + source[ORGANIZATION_ID] + "/" + source.id;
		var streamDefinition = "riox-http --port=" + port + " --path=" + path + " | " +
			"kafka --topic=" + topicName + " --brokerList=" + cfg.kafka + ":9092";
		springxd.createStream(xdStreamId, streamDefinition, function(stream) {
			console.log("stream " + xdStreamId + " created!");
			resolve(stream);
		});
	};

	new Promise(findContainers).
	then(function(conts) {
		cfg.zookeeper = conts[0];
		cfg.kafka = conts[1];
		cfg.springxd = conts[2];
		springxd.endpointURL = "http://" + cfg.springxd + ":9393";
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
	}, function(error) {
		console.log("Error:", error);
		errorCallback(error);
	});

};

exports.updateStreamSource = function (req, res) {
var streamSource = new StreamSource(req.body);
streamSource.save(req.params.id, function (err, obj) {
  if (err)
    return validationError(res, err);
  res.json(obj);
});
};

exports.showStreamSource = function (req, res, next) {
var id = req.params.id;

StreamSource.findById(id, function (err, obj) {
  if (err)
    return next(err);
  if (!obj)
    return res.send(404);
  res.json(obj);
});
};

exports.destroyStreamSource = function (req, res) {
StreamSource.findByIdAndRemove(req.params.id, function (err, obj) {
  if (err)
    return res.send(500, err);
  return res.send(204);
});
};

