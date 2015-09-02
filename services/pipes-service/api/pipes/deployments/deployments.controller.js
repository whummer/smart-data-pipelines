'use strict';

// var PipeProcessor = require('./pipeprocessor.model.js');
var auth = require('riox-services-base/lib/auth/auth.service');
var riox = require('riox-shared/lib/api/riox-api');
var errors = require('riox-services-base/lib/util/errors');
var util = require('util');
var Promise = require('bluebird');
var log = global.log;

var SpringXdDeployer = require('./springxd/springxd.deployer');
var Pipe = require('../pipe.model').Model;
var PipeDeployment = require('./deployment.model').Model;

exports.findById = function (req, res, next) {
	log.debug("deployments.controller.findById: ", JSON.stringify(req.body));
	let id = req.params.id;
	log.debug('Finding deployment by id %s', id);
	PipeDeployment.findByIdQ(id).then(deployment => {
		log.debug('Found deployment with ID %s', id);
		return res.json(200, deployment);
	}).catch(error => {
		log.error('Cannot load deployment by ID "%s": ', error);
		return next(errors.NotFoundError('No such deployment: ', pipeId));
	})
};

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
		.then( pipe => {
			log.debug("Pipe with id '%s' and name '%s' found in DB", pipe._id, pipe.name);
			// log.debug("pipe definition: %s", JSON.stringify(result));
			return new SpringXdDeployer().deploy(pipe, environment);
		})
		.then( deploymentStatus => {
			let deployment = new PipeDeployment();
			let user = auth.getCurrentUser(req);
			deployment[PIPE_ID] = pipeId;
			deployment[PIPE_ENVIRONMENT] = environment;
			deployment[CREATOR_ID] = user[ID];
			deployment[STATUS] = deploymentStatus;
			return deployment;
		})
		.then( deployment => {

			deployment.saveQ().then(savedDeployment => {
				log.info('Saved deployment with ID: ', savedDeployment.id);
				res.setHeader('Location', req.getUrl() + '/' + savedDeployment.id);
				return res.json(201, { "id" : savedDeployment.id });
			}).catch(error => {
				return validationError(error, next);
			});

		})
		.catch( err => {
			log.debug('Error deploying pipe \'%s\' does not exist: ', pipeId, err);
			var error = {};
			error[ERROR_MESSAGE] = util.format("Pipe with id '%s' not found.", pipeId)
			res.json(404, error);
		});
};

exports.listAll = function (req, res, next) {
	log.debug("deployments.controller.listAll: ", JSON.stringify(req.body));

	PipeDeployment.findQ({}).then(deployments => {
		if (!deployments || deployments.length == 0) {
			return next(errors.NotFoundError('No deployments found'));
		}
		log.info('Loaded %d deployments', pipes.length);
		return res.json(200, pipes);
	}).catch(error => {
		log.error('Cannot list deployments: ', error);
		return next(errors.InternalError('Cannot list deployments', error));
	});
};

// TODO this is not implemented correctly yet. Updating a deployment is more
// complex and we need to see how we can do this with XD.
exports.update = function (req, res, next) {
	log.debug("deployments.controller.update: ", JSON.stringify(req.body));

	let id = req.params.id;
	let deployment = req.body;
	log.debug('Updating deployment "%s": %s', id, deployment);
	PipeDeployment.findByIdAndUpdate(id, deployment, {upsert: true}, (err, doc) => {
		if (err) {
			log.error("Cannot update deployment: ", err);
			return next(errors.InternalError("Cannot update deployment ", err));
		}
		return res.json(200, doc);
	});
};

exports.delete = function (req, res, next) {
	log.debug("deployments.controller.delete: ", JSON.stringify(req.body));

	let id = req.params.id;
	log.debug('Deleting deployment with id %s', id);

	PipeDeployment.findByIdQ(id)
		.then( deployment => {
			return new SpringXdDeployer().undeploy(deployment);
		})
		.then( status => {
			log.debug("Status: ", status);
			return PipeDeployment.remove({_id: id});
		})
		.then( pipeId => {
			log.debug('Deleted deployment: ', pipeId);
			return res.json(201);
		})
		.catch( error => {
			log.error('Cannot delete deployment with id %d: %s', id, error);
			return next(errors.InternalError('Cannot delete deployment', error));
		});
};



// helpers
//
var validationError = function (err, next) {
	return next(errors.UnprocessableEntity("You passed a broken object", err));
};
