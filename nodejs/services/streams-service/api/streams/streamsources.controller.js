'use strict';

var StreamSource = require('./streamsource.model.js');
var passport = require('passport');
var auth = require('riox-services-base/lib/auth/auth.service');
var riox = require('riox-shared/lib/api/riox-api');
var springxd = require('riox-services-base/lib/util/springxd.util');
var containers = require('riox-services-base/lib/util/containers.util');
var path = require('path');
var errors = require('riox-services-base/lib/util/errors');

var log = global.log || require('winston');


function list(query, req, res, next) {
	var fetchXdInfo = req.query.fetchxdinfo || false;
	log.debug("Listing streamsources. Fetch XD info: ", fetchXdInfo);

	StreamSource.find(query, function (err, list) {
		if (err) {
			return next(errors.InternalError("Unable to list stream sources", err));
		}

		if (fetchXdInfo) {
			var xdInfoPromises = [];
			var response = [];

			list.forEach(function (streamSource) {
				response.push(streamSource);
				xdInfoPromises.push(
					new Promise(function (resolve, reject) {
						var streamSourceId = "producer-" + streamSource._id;
						log.info("Fetching XD information for stream: ", streamSourceId);
						springxd.findStream(streamSourceId,
							function (streamInfo) {
								if (!streamInfo) {
									log.info("No XD info for stream '" + streamSourceId + "'");
									streamSource.deployed = false;
								} else {
									log.info("Found streamInfo for ID '" + streamSourceId + "': ", streamInfo);
									streamSource.deployed = streamInfo.deployed;
								}

								resolve();
							},
							function (err) {
								log.error("Cannot get XD info for stream '" + streamSourceId + "': ", err);
								reject(err);
							});
					}));
			});

			log.info("About to resolve: ", xdInfoPromises);
			Promise.all(xdInfoPromises).then(function (result) {
				log.info("Resolved: ", result);
				res.json(200, response);
			});

			log.info("After resolved");

		} else {
			res.json(200, list);
		}
	});
}

///
/// METHODS FOR  '/streams/sources'
///

exports.indexStreamSource = function (req, res, next) {
	return list({}, req, res, next);
};

exports.listProvided = function (req, res, next) {
	var user = auth.getCurrentUser(req);
	var query = {ownerId: user.id};
	query[OWNER_ID] = user.id;
	query = {}; // TODO remove! (testing only)
	return list(query, req, res, next);
};

exports.listConsumed = function (req, res, next) {
	var user = auth.getCurrentUser(req);
	var query = {};
	riox.access(query, {
		callback: function (data, response) {
			var ids = [];
			data.forEach(function (el) {
				ids.push(el[SOURCE_ID]);
			});
			var query = {_id: {$in: ids}};
			return list(query, req, res, next);
		},
		headers: req.headers
	});
};

exports.createStreamSource = function (req, res, next) {
	var streamSource = new StreamSource(req.body);

	if (!streamSource.connector || streamSource.connector.type != "http") {
		return validationError("Unsupported Connector-Type. Only HTTP is supported at the moment", next);
	}
	if (!streamSource[ORGANIZATION_ID]) {
		return validationError("Please provide a valid " + ORGANIZATION_ID + " for this source.", next);
	}
	if (!streamSource[PERMIT_MODE]) {
		return validationError("Please provide a valid " + PERMIT_MODE + " for this source.", next);
	}

	streamSource.save(function (err, obj) {
		if (err) {
			return validationError(err, next);
		}

		res.json(obj);
	});
};

exports.applyStreamSource = function (req, res, next) {
	var sourceId = req.params.id;
	applyByStreamSourceId(sourceId, function (result) {
		res.json(result);
	}, function (error) {
		next(error)
	});
};

var applyByStreamSourceId = exports.applyByStreamSourceId = function (id, callback, errorCallback) {
	log.debug("Applying stream-source by id: ", id);
	StreamSource.findById(id, function (err, obj) {
		if (err)
			return errorCallback(errors.InternalError("Cannot apply stream-source", err));

		if (!obj)
			return errorCallback(errors.NotFoundError("No such stream-source: " + id));

		applyByStreamSource(
			obj,
			function (result) {
				callback(result);
			},
			errorCallback
		);
	});
};

var applyByStreamSource = exports.applyByStreamSource = function(source, callback, errorCallback) {
	if(!source.id || !source[ORGANIZATION_ID]) {
		return errorCallback("Please provide valid source id and source organization id");
	}

	var xdStreamId = "producer-" + source.id;
	var topicName = "producer-" + source.id;

	var cfg = {};

	var findStream = function(resolve, reject) {
		springxd.findStream(xdStreamId, resolve, reject);
	};

	var createStream = function(resolve, reject) {
		// create the SpringXD stream

		var port = 9000;
		var path = "/" + source[ORGANIZATION_ID] + "/" + source.id;
		var streamDefinition = "riox-http --port=" + port + " --path=" + path +
			" | " + "kafka --topic=" + topicName +
			" --brokerList=" + config.kafka.hostname + ":" + config.kafka.port;

		springxd.createStream(xdStreamId, streamDefinition, function(stream) {
			console.log("stream " + xdStreamId + " created!");
			resolve(stream);
		});
	};

	new Promise(findStream).
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

exports.updateStreamSource = function (req, res, next) {
	var streamSource = new StreamSource(req.body);
	streamSource.save(req.params.id, function (err, obj) {
		if (err) {
			return validationError(err, next);
		}

		res.json(obj);
	});
};

exports.showStreamSource = function (req, res, next) {
	var id = req.params.id;

	StreamSource.findById(id, function (err, obj) {
		if (err) {
			return next(errors.InternalError("Cannot lookup stream source", err));
		}

		if (!obj) {
			return next(errors.NotFoundError("No such stream-source: " + id));
		}

		res.json(obj);
	});
};

exports.destroyStreamSource = function (req, res) {
	var streamId = req.param.id;
	StreamSource.findByIdAndRemove(streamId, function (err) {
		if (err) {
			return next(erros.InternalError("Cannot remove stream with id " + streamId, err));
		}

		return res.send(204);
	});
};

var validationError = function (err, next) {
	return next(errors.UnprocessableEntity("You passed a broken object", err));
};
