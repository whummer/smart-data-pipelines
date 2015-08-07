'use strict';

var PipeProcessor = require('./pipeprocessor.model.js');
var passport = require('passport');
var auth = require('riox-services-base/lib/auth/auth.service');
var riox = require('riox-shared/lib/api/riox-api');
// var springxd = require('riox-services-base/lib/util/springxd.util');
var errors = require('riox-services-base/lib/util/errors');

var log = global.log;

//
// route implementations
//
function list(query, req, res) {
	PipeProcessor.find(query, function (err, list) {
		if (err) {
			return next(errors.InternalError("Cannot list processors", err));
		}

		res.json(200, list);
	});
}

exports.index = function (req, res) {
	return list({}, req, res);
};

exports.create = function (req, res, next) {
	var processor = new PipeProcessor(req.body);

	processor.save(function (err, obj) {
		if (err) {
			return validationError(err, next);
		}

		res.json(obj);
	});
};

exports.apply = function (pipe, callback, errorCallback) {

	if (!pipe[SOURCE_ID] || !pipe[SINK_ID]) {
		return errorCallback("Please provide a valid " + SOURCE_ID + " and " + SINK_ID);
	}

	var cfg = {};

	var xdId = "processors-" + pipe[ID];

	var findStream = function(resolve, reject) {
		springxd.findStream(xdId, resolve, reject);
	};


	/* Loads all processors from the DB given their IDs. */
	var findProcessors = function(resolve, reject) {
		PipeProcessor.find({ _id: { '$in': pipe[PROCESSORS] } }, function (err, obj) {
			if (err || !obj) {
				reject(err);
			}

			log.debug("Processor elements: ", obj.length);
			resolve(obj);
		});
	}


	var createXdStream = function(resolve, reject) {

		// create the SpringXD stream
		var sourceTopic = "producer-" + pipe[SOURCE_ID];
		var sinkTopic = "consumer-" + pipe[SINK_ID];
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
			return stream ? stream : new Promise(createXdStream);
		}).
		then(function (stream) {
			cfg.stream = stream;
			callback({result: stream});
		});
};

exports.update = function (req, res) {
	var processor = new PipeProcessor(req.body);
	processor.save(req.params.id, function (err, obj) {
		if (err) {
			return validationError(err, next);
		}
		res.json(obj);
	});
};

exports.show = function (req, res, next) {
	var id = req.params.id;
	PipeProcessor.findById(id, function (err, obj) {
		if (err || !obj) {
			return next(errors.NotFoundError("Cannot find processor with ID " + id));
		}
		res.json(obj);
	});
};

exports.destroy = function (req, res) {
	var id = req.params.id;
	PipeProcessor.findByIdAndRemove(id, function (err) {
		if (err) {
			return next(errors.InternalError("Cannot remove processor with ID " + id, err));
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
