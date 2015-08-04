'use strict';

var Pipe = require('./pipe.model.js');
var passport = require('passport');
var riox = require('riox-shared/lib/api/riox-api');
var sourcesCtrl = require('./pipesources.controller');
var sinksCtrl = require('./pipesinks.controller');
var procsCtrl = require('./pipeprocessors.controller');
var errors = require('riox-services-base/lib/util/errors');


var log = global.log;

exports.listAll = function (req, res, next) {
	Pipe.find({}, function (err, list) {
		if (err || !list.length) {
			return next(errors.NotFoundError("Cannot list"));
		}

		res.json(200, list);
	});
};

exports.create = function (req, res, next) {
	var obj = new Pipe(req.body);
	obj.save(function (err, obj) {
		if (err) {
			return validationError(err, next);
		}
		res.json(obj);
	});
};

exports.apply = function (req, res, next) {
	Pipe.findById(req.params.id, function (err, obj) {
		if (err) {
			return validationError(err, next);
		}
		doApply(obj, function () {
			res.json(obj);
		}, function (error) {
			log.error("Cannot apply: ", error);
			return next(errors.InternalError("Cannot apply: " + obj._id, error));
		});
	});
};

var doApply = function (pipe, callback, errorCallback) {

	var applySource = function (resolve, reject) {
		sourcesCtrl.applyBySourceId(pipe[SOURCE_ID], resolve, reject);
	};

	var applySink = function (resolve, reject) {
		sinksCtrl.applyBySinkId(pipe[SINK_ID], resolve, reject);
	};

	var applyProcessors = function (resolve, reject) {
		procsCtrl.apply(pipe, resolve, reject);
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
			log.error("Cannot apply: ", error);
			errorCallback(error);
		});
};

/* Bootstrap metadata */

exports.bootstrap = function(req, res) {
	var insertData = require("../bootstrap");
	insertData(function(result) {
		res.json({});
	}, function(err) {
		res.status(500).json({error: err});
	});
};

//
// helpers
//
var validationError = function (err, next) {
	return next(errors.UnprocessableEntity("You passed a broken object", err));
};

