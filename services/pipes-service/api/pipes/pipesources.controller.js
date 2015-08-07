'use strict';

var PipeSource = require('./pipesource.model.js');
var passport = require('passport');
var auth = require('riox-services-base/lib/auth/auth.service');
var riox = require('riox-shared/lib/api/riox-api');
// var springxd = require('riox-services-base/lib/util/springxd.util');
var path = require('path');
var errors = require('riox-services-base/lib/util/errors');

var log = global.log || require('winston');


function list(query, req, res, next) {
	var fetchXdInfo = req.query.fetchxdinfo || false;

	PipeSource.find(query, function (err, list) {
		if (err) {
			return next(errors.InternalError("Unable to list sources", err));
		}

		if (fetchXdInfo) {
			var xdInfoPromises = [];
			var response = [];

			list.forEach(function (src) {
				response.push(src);
				xdInfoPromises.push(
					new Promise(function (resolve, reject) {
						var sourceId = "producer-" + src._id;
						log.info("Fetching XD information for stream: ", sourceId);
						springxd.findStream(sourceId,
							function (streamInfo) {
								if (!streamInfo) {
									log.info("No XD info for stream '" + sourceId + "'");
									src.deployed = false;
								} else {
									log.info("Found streamInfo for ID '" + sourceId + "': ", streamInfo);
									src.deployed = streamInfo.deployed;
								}

								resolve();
							},
							function (err) {
								log.error("Cannot get XD info for stream '" + sourceId + "': ", err);
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
/// METHODS FOR  '/pipes/sources'
///

exports.index = function (req, res, next) {
	/* TODO: check authorization */
	return list({}, req, res, next);
};

exports.indexAll = function (req, res, next) {
	var query = {};
	if(req.query[ORGANIZATION_ID]) {
		query[ORGANIZATION_ID] = req.query[ORGANIZATION_ID];
	}
	return list(query, req, res, next);
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

exports.create = function (req, res, next) {
	var source = new PipeSource(req.body);
	/* whether or not to create backend stream infrastructure */
	var doCreateSprinxdStream = true;
	var doWaitForSprinxdCreation = false;

	if (!source.connector || source.connector.type != "http") {
		return validationError("Unsupported Connector-Type. Only HTTP is supported at the moment", next);
	}
	if (!source[ORGANIZATION_ID]) {
		return validationError("Please provide a valid " + ORGANIZATION_ID + " for this source.", next);
	}
	if (!source[PERMIT_MODE]) {
		return validationError("Please provide a valid " + PERMIT_MODE + " for this source.", next);
	}
	// TODO check if ORGANIZATION_ID belongs to calling user!

	source.save(function (err, obj) {
		if (err) {
			return validationError(err, next);
		}
		if(doCreateSprinxdStream) {
			applyBySourceId(obj.id, function() {
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

exports.apply = function (req, res, next) {
	var sourceId = req.params.id;
	applyBySourceId(sourceId, function (result) {
		res.json(result);
	}, function (error) {
		next(error)
	});
};

var applyBySourceId = exports.applyBySourceId = function (id, callback, errorCallback) {
	PipeSource.findById(id, function (err, obj) {
		if (err)
			return errorCallback(errors.InternalError("Cannot apply source", err));

		if (!obj)
			return errorCallback(errors.NotFoundError("No such source: " + id));

		applyBySource(
			obj,
			function (result) {
				callback(result);
			},
			errorCallback
		);
	});
};

var applyBySource = exports.applyBySource = function(source, callback, errorCallback) {
	log.debug("Applying source: ", source[ID]);
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

exports.update = function (req, res, next) {
	if(req.body[ID] != req.params.id) {
		return errorCallback(errors.UnprocessableEntity("Invalid entity IDs."));
	}
	PipeSource.findById(req.params.id, function (err, obj) {
		if (err)
			return errorCallback(errors.InternalError("Cannot update source", err));
		if (!obj)
			return errorCallback(errors.NotFoundError("No such source: " + id));

		// TODO: check permission

		/* copy values */
		obj[NAME] = req.body[NAME];
		obj[OPERATIONS] = req.body[OPERATIONS];
		obj[SCHEMAS] = req.body[SCHEMAS];
		obj[DOMAIN_NAME] = req.body[DOMAIN_NAME];
		obj[BACKEND_ENDPOINTS] = req.body[BACKEND_ENDPOINTS];
		obj[CONNECTOR] = req.body[CONNECTOR];

		obj.save(function (err, obj) {
			if (err) {
				return validationError(err, next);
			}
			/* return result */
			res.json(obj);
		});
	});

};

exports.show = function (req, res, next) {
	var id = req.params.id;

	PipeSource.findById(id, function (err, obj) {
		if (err) {
			return next(errors.InternalError("Cannot lookup source", err));
		}
		if (!obj) {
			return next(errors.NotFoundError("No such source: " + id));
		}
		/* return result */
		res.json(obj);
	});
};

exports.destroy = function (req, res) {
	var id = req.param.id;
	PipeSource.findByIdAndRemove(id, function (err) {
		if (err) {
			return next(erros.InternalError("Cannot remove source with id " + id, err));
		}
		return res.send(204);
	});
};

var validationError = function (err, next) {
	return next(errors.UnprocessableEntity("You passed a broken object", err));
};
