'use strict';

var StreamSource = require('./streamsource.model.js');
var passport = require('passport');
var auth = require('riox-services-base/lib/auth/auth.service');
var riox = require('riox-shared/lib/api/riox-api');
var springxd = require('riox-services-base/lib/util/springxd.util');
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

		list.forEach(function (streamSource) {
			/* set endpoint info: */
			setEndpoint(streamSource);
		});

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
				res.json(response);
			});

			log.info("After resolved");

		} else {
			res.json(list);
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
	var query = {};
	var orgIDs = user.getOrganizationIDs();
	query[ORGANIZATION_ID] = { "$in": orgIDs };
	return list(query, req, res, next);
};

exports.listProvidedByName = function (req, res, next) {
	var user = auth.getCurrentUser(req);
	var query = {};
	var orgIDs = user.getOrganizationIDs();
	query[ORGANIZATION_ID] = { "$in": orgIDs };
	query[NAME] = req.params.name;
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
	/* whether or not to create backend stream infrastructure */
	var doCreateSprinxdStream = true;
	var doWaitForSprinxdCreation = false;

	if (!streamSource.connector || streamSource.connector.type != "http") {
		return validationError("Unsupported Connector-Type. Only HTTP is supported at the moment", next);
	}
	if (!streamSource[ORGANIZATION_ID]) {
		return validationError("Please provide a valid " + ORGANIZATION_ID + " for this source.", next);
	}
	if (!streamSource[PERMIT_MODE]) {
		return validationError("Please provide a valid " + PERMIT_MODE + " for this source.", next);
	}
	// TODO check if ORGANIZATION_ID belongs to calling user!

	/* set endpoint info */
	setEndpoint(streamSource);

	streamSource.save(function (err, obj) {
		if (err) {
			return validationError(err, next);
		}
		if(doCreateSprinxdStream) {
			applyByStreamSourceId(obj.id, function() {
				if(doWaitForSprinxdCreation) {
					res.json(obj);
				}
			}, function(err) {
				next("Unable to create stream.", err);
			});
		}
		if(!doWaitForSprinxdCreation) {
			res.json(obj);
		}
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
	log.debug("Applying stream-source: ", source[ID]);
	if(!source[ID] || !source[ORGANIZATION_ID]) {
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

		var port = config.xdcontainer.inbound.port;
		var path = "/" + source[ORGANIZATION_ID] + "/" + source.id;
		var streamDefinition = "http-singleton --port=" + port + " --path=" + path +
			" | " + "kafka --topic=" + topicName +
			" --brokerList=" + config.kafka.hostname + ":" + config.kafka.port +
			" --inputType=text/plain";

		springxd.createStream(xdStreamId, streamDefinition, function(stream) {
			console.log("stream " + xdStreamId + " created!");
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
		}, function(error) {
			console.log("Error:", error);
			errorCallback(error);
		});

};

exports.updateStreamSource = function (req, res, next) {
	var streamSource = new StreamSource(req.body);
	// TODO: check permission
	streamSource.save(req.params.id, function (err, obj) {
		if (err) {
			return validationError(err, next);
		}
		/* set endpoint info: */
		setEndpoint(obj);
		/* return result */
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
		/* set endpoint info: */
		setEndpoint(obj);
		/* return result */
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

var setEndpoint = function(source) {
	var host = "xd-inbound.dev.riox.internal"; // TODO!
	source[ENDPOINT] = "http://" + host + ":9000/" +
		source[ORGANIZATION_ID] + "/" + source[ID];
}

var validationError = function (err, next) {
	return next(errors.UnprocessableEntity("You passed a broken object", err));
};
