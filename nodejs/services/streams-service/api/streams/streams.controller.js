'use strict';

var StreamSource = require('./streamsource.model.js');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var auth = require('riox-services-base/lib/auth/auth.service');
var riox = require('riox-shared/lib/api/riox-api');
var rabbitmq = require('./rabbitmq.service');
var springxd = require('./springxd.service');
var portfinder = require('portfinder');

var validationError = function (res, err) {
	return res.json(422, err);
};

function list(query, req, res) {
	StreamSource.find(query, function (err, list) {
		if (err)
			return res.send(500, err);
//		console.log("list consumed", query, list);
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

///
/// METHODS FOR  'stream/source'
///
exports.indexStreamSource = function (req, res) {
	return list({}, req, res);
};


exports.createStreamSource = function (req, res, next) {
	var streamSource = new StreamSource(req.body);

	if (streamSource['sink-config'].connector != "http") {
		res.json(500, {"description": "Unsupported Connector-Type. Only HTTP is supported at the moment"});
		next();
		return;
	}

	streamSource.save(function (err, obj) {
		if (err)
			return validationError(res, err);

		res.json(obj);

		// todo handle rollbacks accordingly (ie.e when exchange cannot be created, rollback the stream creation)

		// create the rabbitmq exchage in the background
		var exchangeId = createExchangeId(streamSource);
		rabbitmq.createExchange(exchangeId);

		// create the SpringXD stream in the background
		var port = 6666;
		portfinder.getPort(function (error, freePort) {
			if (error) {
				console.log("Cannot find unused port: ", error);
				return;
			}

			var streamDefinition = "http --port=" + freePort + "| rabbit --vhost=riox --exchange=" + exchangeId;
			var streamId = streamSource.name + '_' + exchangeId;
			springxd.createStream(streamId, streamDefinition);

      // TODO FR: hack - this needs to be moved to the consensus building code
      rabbitmq.bindQueueToExchange("riox-consumer-1", exchangeId);

		});
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
    //console.log("stream", obj);
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

///
/// METHODS FOR  'stream/processor'
///


///
/// METHODS FOR  'stream/sink'
///



///
/// UTIL METHODS
///

// todo move this somewhere else
function createExchangeId(dataStream) {
	return dataStream._id;
}

