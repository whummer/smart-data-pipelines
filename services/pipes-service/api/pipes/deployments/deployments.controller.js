'use strict';

// var PipeProcessor = require('./pipeprocessor.model.js');
// var passport = require('passport');
var auth = require('riox-services-base/lib/auth/auth.service');
var riox = require('riox-shared/lib/api/riox-api');
//var springxd = require('riox-services-base/lib/util/springxd.util');
var errors = require('riox-services-base/lib/util/errors');

var JsonProcessor = require('./mapping/json.processor');
var log = global.log;

exports.create = function (req, res) {
  log.debug("deployments.controller.create");

  log.debug(req.body);

  var jt = new JsonProcessor(req.body);

  jt.apply(
    function(result) {
      log.info(result);
      res.status(201).send();
    },
    function(error) {
      log.error(error);
      res.json(500, { "error" : error});
    }
  );

};

exports.list = function (req, res) {
	// return list({}, req, res);

  res.json(200, {});
};


exports.find = function (req, res) {
	// return list({}, req, res);

  res.json(200, {});
};
