'use strict';

var Stream = require('./stream.model.js');
var passport = require('passport');
var mongoose = require('mongoose');
var auth = require('riox-services-base/lib/auth/auth.service');
var riox = require('riox-shared/lib/api/riox-api');
var portfinder = require('portfinder');
var sourcesCtrl = require('./streamsources.controller');
var sinksCtrl = require('./streamsinks.controller');
var procsCtrl = require('./streamprocessors.controller');

var validationError = function (res, err) {
	return res.json(422, err);
};

function list(query, req, res) {
	console.log()
	Stream.find(query, function (err, list) {
		if (err)
			return res.send(500, err);
		res.json(200, list);
	});
}

exports.listProvided = function (req, res) {
  var user = auth.getCurrentUser(req);
  var query = {ownerId: user.id};
  query = {}; // TODO remove! (testing only)
  return list(query, req, res);
};

exports.listConsumed = function (req, res) {
  var user = auth.getCurrentUser(req);
  var query = {};
  riox.access(query, {
    callback: function (data, response) {
      console.log("data", data);
      var ids = [];
      data.forEach(function (el) {
        ids.push(el.streamId);
      });
      var query = {_id: {$in: ids}};
      return list(query, req, res);
    },
    headers: req.headers
  });
};

exports.createStream = function (req, res, next) {
	var stream = new Stream(req.body);

	stream.save(function (err, obj) {
		if (err)
			return validationError(res, err);
		res.json(obj);
	});
};

exports.applyStreamConfig = function (req, res, next) {
	var streamId = req.params.id;
	var config = req.body;
	var query = {};
	Stream.find(query, function (err, list) {		
		if (err)
			return validationError(res, err);
		var stream = list[0];
		applyStream(stream, function() {
			res.json(stream);
		}, function(error) {
			res.json(500, {error: error});
		});
	});
};

var applyStream = function(stream, callback, errorCallback) {

	var applySource = function(resolve, reject) {
		console.log("streams.applySource");
		sourcesCtrl.applyByStreamSourceId(stream[SOURCE_ID], resolve, reject);
	};

	var applySink = function(resolve, reject) {
		console.log("streams.applySink");
		sinksCtrl.applyByStreamSinkId(stream[SINK_ID], resolve, reject);
	};

	var applyProcessors = function(resolve, reject) {
		procsCtrl.applyByStream(stream, resolve, reject);
	};

	new Promise(applySource).
	then(function(result) {
		return new Promise(applySink);
	}).
	then(function(result) {
		return new Promise(applyProcessors);
	}).
	then(function(result) {
		return callback(result);
	},
	function(error) {
		console.log("error", error);
		errorCallback(error);
	});

};

var applyStreamSource = function(source, callback) {
	springxd.listStreams(null, function(list) {
		console.log(list);
		callback(list);
	});
};

