'use strict';

// var PipeProcessor = require('./pipeprocessor.model.js');
var auth = require('riox-services-base/lib/auth/auth.service');
var riox = require('riox-shared/lib/api/riox-api');
var errors = require('riox-services-base/lib/util/errors');
var util = require('util');

var JsonProcessor = require('./mapping/json.processor');
var log = global.log;
var Pipe = require('../pipe.model').Model;

exports.create = function (req, res) {
	log.debug("deployments.controller.create");
	var pipeId = req.body[PIPE_ID];

	// handle missing pipeline ID
	if (!pipeId) {
		var error = {};
		error[ERROR_MESSAGE] = util.format("No '%s' field specified", PIPE_ID);
		res.json(400, error);
	}

	log.debug("Looking up pipe with id '%s' ...", pipeId);
	Pipe.findByIdQ(pipeId)
		.then(function (result) {
			log.debug("Pipe with id '%s' and name ''%s' found in DB", result.id, result.name);

			// TODO re-implement this is old legacy code that existed before the object model
			// was created
			log.debug("pipe definition: %s", JSON.stringify(result));
			var jt = new JsonProcessor(result);

			// TODO switch to promises here
			jt.apply();

			res.status(201).end();

			// 	function(result) {
			// 		log.info("deployments.controller.create.apply: ", result);
			// 		res.status(201).end();
			// 	},
			// 	function(error) {
			// 		log.error(error);
			// 		res.json(500, { "error" : error});
			// 	}
			// );

		})
		.catch(function (err) {
			log.debug('Pipe "%s" does not exist: %s', pipeId, err);
			var error = {};
			error[ERROR_MESSAGE] = util.format("Pipe with id '%s' not found.", pipeId)
			res.json(404, error);
		})
		.done();

	// FR TODO decide to go via REST instead of db model (overkill maybe)
	// var query = { };
	// query[PIPE_ID] = req.body[PIPE_ID];
	// riox.get.pipes(req.body[PIPE_ID], {
	// 	headers: req.headers,
	// 	callback:
	// 		function (pipes) {
	// 			log.debug("success: ", pipes);
	// 			}
	// 	},
	// 	function error(error) {
	//
	// 	}
	// );
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
