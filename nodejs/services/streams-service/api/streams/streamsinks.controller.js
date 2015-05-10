'use strict';

var StreamSink = require('./streamsink.model.js');
var passport = require('passport');
var riox = require('riox-shared/lib/api/riox-api');
var containers = require('riox-services-base/lib/util/containers.util');
var springxd = require('riox-services-base/lib/util/springxd.util');
var errors = require('riox-services-base/lib/util/errors');

var log = global.log || require('winston');



function list(query, req, res, next) {
	StreamSink.find(query, function (err, list) {
		if (err) {
			return next(errors.InternalError("Cannot list stream sinks", err));
		}

		res.json(200, list);
	});
}

exports.indexStreamSink = function (req, res, next) {
	return list({}, req, res, next);
};

exports.createStreamSink = function (req, res, next) {
	log.debug('Creating stream-sink: ', req.body);
	var streamSink = new StreamSink(req.body);
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

var applyByStreamSink = exports.applyByStreamSink = function (sink, callback, errorCallback) {
	if (!sink.id || !sink[ORGANIZATION_ID]) {
		return errorCallback("Please provide valid id and organization id");
	}

	var xdStreamId = "consumer-" + sink.id;
	var topicName = "consumer-" + sink.id;

	var cfg = {};

	var findContainers = function (resolve, reject) {
		containers.getContainersIPs(["zookeeper", "kafka"], resolve);
	};

	var findStream = function (resolve, reject) {
		springxd.findStream(xdStreamId, resolve, reject);
	};

	var createStream = function (resolve, reject) {

		// create the SpringXD stream
		var port = 9001;
		var path = "/" + sink[ORGANIZATION_ID] + "/" + sink.id;
		var mimeType = "text/plain";
		var streamDefinition = "kafka --zkconnect=" + cfg.zookeeper + ":2181 --topic=" + topicName +
			" --outputType=" + mimeType + " | " + "websocket --port=" + port + " --path=" + path;

		springxd.createStream(xdStreamId, streamDefinition, function (stream) {
			log.info("consumer stream " + xdStreamId + " created!");
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


//
// helper functions
//

var validationError = function (err, next) {
	return next(errors.UnprocessableEntity("You passed a broken object", err));
};
