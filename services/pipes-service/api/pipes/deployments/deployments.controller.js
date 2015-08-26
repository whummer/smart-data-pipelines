'use strict';

// var PipeProcessor = require('./pipeprocessor.model.js');
var auth = require('riox-services-base/lib/auth/auth.service');
var riox = require('riox-shared/lib/api/riox-api');
var errors = require('riox-services-base/lib/util/errors');
var util = require('util');
var Promise = require('bluebird');

var SpringXdDeployer = require('./springxd/springxd.deployer');
var log = global.log;
var Pipe = require('../pipe.model').Model;

exports.create = function (req, res) {
	log.debug("deployments.controller.create: ", JSON.stringify(req.body));
	let pipeId = req.body[PIPE_ID];
	let environment = req.body[PIPE_ENVIRONMENT] || 'development';

	// handle missing pipeline ID
	if (!pipeId) {
		var error = {};
		error[ERROR_MESSAGE] = util.format("No '%s' field specified", PIPE_ID);
		// log.debug(error);
		return res.json(400, error);
	}

	log.debug("Looking up pipe with id '%s' ...", pipeId);
	Pipe.findByIdQ(pipeId)
		.then(function (result) {
			log.debug("Pipe with id '%s' and name '%s' found in DB", result.id, result.name);
			// log.debug("pipe definition: %s", JSON.stringify(result));
			let jt = new SpringXdDeployer(result);

			jt.apply("development") // TODO fix environment
			.then(function (result) {
				// log.debug("RESULT: ", JSON.stringify(result));
				return res.json(201, result);
			});
		})
		.catch(function (err) {
			log.debug('Error deploying pipe \'%s\' does not exist: ', pipeId, err);
			var error = {};
			error[ERROR_MESSAGE] = util.format("Pipe with id '%s' not found.", pipeId)
			res.json(404, error);
		})
		.done();


};

exports.list = function (req, res) {
	log.debug("deployments.controller.list");

	// return list({}, req, res);

	res.json(200, {});
};


exports.find = function (req, res) {
	// return list({}, req, res);

	res.json(200, {});
};
