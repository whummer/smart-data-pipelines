'use strict';

var StreamProcessor = require('./streamprocessor.model.js');
var passport = require('passport');
var auth = require('riox-services-base/lib/auth/auth.service');
var riox = require('riox-shared/lib/api/riox-api');
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
	log.debug("Applying stream (e2e, processors): ", stream[ID]);

	if (!stream[SOURCE_ID] || !stream[SINK_ID]) {
		return errorCallback("Please provide a valid stream with " + SOURCE_ID + " and " + SINK_ID);
	}

	var cfg = {};

	var xdStreamId = "processors-" + stream[ID];

	var findStream = function(resolve, reject) {
		springxd.findStream(xdStreamId, resolve, reject);
	};


	/* Loads all processors from the DB given their IDs from the stream. */
	var findProcessors = function(resolve, reject) {
		StreamProcessor.find({ _id: { '$in': stream[PROCESSORS] } }, function (err, obj) {
			if (err) {
				log.error("Cannot apply stream-processor", err);
				reject(err);
			}
			if (!obj) {
				//return next(errors.NotFoundError("Cannot find stream-processor with ID " + id));
				log.error("Cannot find stream-processor with ID " + id, err);
				reject(err);
			}

			log.debug("Processor elements: ", obj.length);
			resolve(obj);
		});
	}


	var createStream = function(resolve, reject) {

		// create the SpringXD stream
		var sourceTopic = "producer-" + stream[SOURCE_ID];
		var sinkTopic = "consumer-" + stream[SINK_ID];
		var mimeType = "text/plain";
		//var mimeType = "application/json";



		// add kafka stream that is reading from the source topic
		var streamDefinition = "k1: kafka --zkconnect=" + config.zookeeper.hostname +
			":" + config.zookeeper.port  + " --topic=" + sourceTopic + " --outputType=" + mimeType;

		// add all stream processors
		cfg.processors.forEach(function(entry) {
			log.debug("processor data: ", JSON.stringify(entry));

			var definition = entry.type;
			if(!definition) {
				/* set default definition (pass-through 'transform') */
				definition = "transform";
			}
			entry[PAYLOAD][INPUT].forEach(function(input) {
				definition +=  " --" + input[KEY] + "=" + input[VALUE]
			});

			log.debug("processor definition: ", definition);

			streamDefinition += " | " + definition;
		});

		// add kafka
		streamDefinition += " | k2: kafka --topic=" + sinkTopic + " --brokerList=" +
			config.kafka.hostname + ":" + config.kafka.port + " --inputType=" + mimeType;

		springxd.createStream(xdStreamId, streamDefinition, function (stream) {
			log.debug("processors stream " + xdStreamId + " created!");
			resolve(stream);
		});

	};

	new Promise(findProcessors).
		then(function (processors) {
			cfg.processors = processors;
			return new Promise(findStream)
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
