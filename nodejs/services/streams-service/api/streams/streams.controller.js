'use strict';

var Stream = require('./stream.model.js');
var passport = require('passport');
var riox = require('riox-shared/lib/api/riox-api');
var sourcesCtrl = require('./streamsources.controller');
var sinksCtrl = require('./streamsinks.controller');
var procsCtrl = require('./streamprocessors.controller');
var errors = require('riox-services-base/lib/util/errors');


var log = global.log;

exports.listAll = function (req, res, next) {
	log.debug("Listing all streams");
	Stream.find({}, function (err, list) {
		if (err) {
			return next(errors.InternalError("Cannot list streams", err));
		}

		if (!list.length) {
			return next(errors.NotFoundError("No Streams available"));
		}

		res.json(200, list);
	});
};

exports.createStream = function (req, res, next) {
	var stream = new Stream(req.body);
	stream.save(function (err, obj) {
		if (err) {
			return validationError(err, next);
		}
		res.json(obj);
	});
};

exports.applyStreamConfig = function (req, res, next) {
	Stream.findById(req.params.id, function (err, obj) {
		if (err) {
			return validationError(err, next);
		}
		applyStream(obj, function () {
			res.json(obj);
		}, function (error) {
			log.error("Cannot apply stream: ", error);
			return next(errors.InternalError("Cannot apply stream: " + obj._id, error));
		});
	});
};

var applyStream = function (stream, callback, errorCallback) {

	var applySource = function (resolve, reject) {
		sourcesCtrl.applyByStreamSourceId(stream[SOURCE_ID], resolve, reject);
	};

	var applySink = function (resolve, reject) {
		sinksCtrl.applyByStreamSinkId(stream[SINK_ID], resolve, reject);
	};

	var applyProcessors = function (resolve, reject) {
		procsCtrl.applyByStream(stream, resolve, reject);
	};

	new Promise(applySource).
		then(function (result) {
			return new Promise(applySink);
		}).
		then(function (result) {
			return new Promise(applyProcessors);
		}).
		then(function (result) {
			return callback(result);
		},
		function (error) {
			log.error("Cannot apply stream: ", error);
			errorCallback(error);
		});
};

//
// helpers
//
var validationError = function (err, next) {
	return next(errors.UnprocessableEntity("You passed a broken object", err));
};

