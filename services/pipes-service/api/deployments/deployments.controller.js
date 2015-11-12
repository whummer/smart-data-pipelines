'use strict';

var auth = require('riox-services-base/lib/auth/auth.service');
var riox = require('riox-shared/lib/api/riox-api');
var errors = require('riox-services-base/lib/util/errors');
var util = require('util');
var Promise = require('bluebird');
var Client = require('node-rest-client').Client;
var log = global.log;

var ENVIRONMENT_PROD = 'PROD';
var ENVIRONMENT_TEST = 'TEST';

var Deployer = require('./k8s/k8s.deployer');
var Connector = require('./k8s/k8s.connector');

var Pipe = require('../pipes/pipe.model').Model;
var PipeDeployment = require('./deployment.model').Model;

exports.findByPipeId = function (req, res, next) {
	var query = {};
	query[PIPE_ID] = req.params.id;
	PipeDeployment.findQ(query).then(deployments => {
		if(deployments.length && deployments[0]) {
			var deployment = deployments[0];
			log.debug('Found deployment for PIPE_ID %s', req.params.id);
			getDeploymentDetails(deployment, req, res, next);
		} else {
			res.status(404);
			return res.json({error: 'No deployment found for PIPE_ID ' + req.params.id});
		}
	}).catch(error => {
		log.error('Cannot load deployment: %s', error);
		res.status(404);
		res.json({error: 'No deployment for pipe:' + req.params.id});
	});
};

exports.findById = function (req, res, next) {
	log.debug('deployments.controller.findById');
	var id = req.params.id;
	PipeDeployment.findByIdQ(id).then(deployment => {
		getDeploymentDetails(deployment, req, res, next);
	}).catch(error => {
		log.error('Cannot load deployment by ID "%s": ', error);
		return next(errors.NotFoundError('No such deployment:', pipeId));
	});
};

var getDeploymentDetails = function(deployment, req, res, next) {
	var id = req.params.id;
	var pipeId = deployment[PIPE_ID];
	var environment = deployment[PIPE_ENVIRONMENT];

	var result = clone(deployment);

	/* find pipe */
	Pipe.findByIdQ(pipeId).then(pipe => {
		log.debug('Found pipe with ID %s', pipeId);

		var connector = new Connector();

		result[PIPE_ELEMENTS] = result[PIPE_ELEMENTS] || [];

		var els = pipe[PIPE_ELEMENTS];
		var proms = [];
		for(var i = 0; i < els.length; i ++) {

			var el = els[i];
			el[PIPE_ID] = pipeId;
			var elStatus = {};
			elStatus[ID] = el[ID];
			result[PIPE_ELEMENTS].push(elStatus);

			function handleNode(node, nodeStatus) {
				if(connector.isActualPipeElement(node)) {
					/* fetch deployment info */
					return connector.waitForPipeElementStatus(node, environment).
						then(status => {
							var statusString = status[STATUS];
							if(statusString === STATUS_RUNNING) {
								statusString = STATUS_DEPLOYED;
							}
							nodeStatus[STATUS] = statusString;
						}).catch(error => {
							log.warn('Error getting deployment details.', error);
							nodeStatus[STATUS] = STATUS_UNKNOWN;
						});
				} else {
					nodeStatus[STATUS] = STATUS_NOT_DEPLOYABLE;
					return Promise.resolve();
				}
			}

			var prom = handleNode(el, elStatus);
			proms.push(prom);
		}

		Promise.all(proms).then(function() {
			log.warn("Got all deployment details.", result);
			return res.json(result);
		});
	}).catch(error => {
		log.error('Cannot load deployment: %s', error);
		return next(errors.NotFoundError('No such deployment: ', pipeId));
	});
};

exports.deploy = function (req, res) {
	var user = auth.getCurrentUser(req);
	var environment = ENVIRONMENT_PROD;
	var deployer = new Deployer({user: user});
	var pipeId = req.body[PIPE_ID];

	/* handle missing pipeline ID */
	if (!pipeId) {
		var error = {};
		error[ERROR_MESSAGE] = util.format('No "%s" field specified', PIPE_ID);
		return res.json(400, error);
	}

	Pipe.findByIdQ(pipeId).then(pipe => {
		if(!pipe) {
			var error = {};
			error[ERROR_MESSAGE] = 'Cannot find pipe with ID "' + pipeId + '"';
			log.warn(error[ERROR_MESSAGE]);
			return res.status(404).json(error);
		}
		log.debug('Found pipe with ID %s', pipeId);
		return doDeploy(deployer, environment, pipe, req, res);
	}).
	catch( error => {
		log.debug('Cannot deploy pipe by ID "%s": ', error);
		res.status(500);
		res.json({error: error});
	});
};

exports.preview = function(req, res) {
	var user = auth.getCurrentUser(req);
	var deployer = new Deployer({user: user});
	var pipe = req.body;
	var environment = ENVIRONMENT_TEST;
	return doDeploy(deployer, environment, pipe, req, res);
};

var doDeploy = function(deployer, environment, pipe, req, res) {
	log.debug('Deploy pipe with ID "%s" and name "%s"', pipe[ID], pipe.name);

	/* set a higher request timeout as this call may take a while! */
	// TODO: make this function an aysnc operation
	req.setTimeout(1000*60*5);

	// TODO: think about how we deal with existing deployments --> update them!

	return deployer.
		deploy(pipe, environment).
		then(deploymentStatuses => {
			let deployment = new PipeDeployment();
			let user = auth.getCurrentUser(req);
			deployment[PIPE_ID] = pipe[ID];
			deployment[PIPE_ENVIRONMENT] = environment;
			deployment[CREATOR_ID] = user[ID];
			deployment[STATUS] = getCommonDenominatorStatus(deploymentStatuses);
			deployment[PIPE_ELEMENTS] = deploymentStatuses;
			log.debug('saving deployment', JSON.stringify(deployment));
			deployment.saveQ().then(deployment => {
				var location = servicesConfig.pipedeployments.url + '/' + deployment[ID];
				res.setHeader('Location', location);
				log.debug('Done deployment. Location:', location);
				res.status(201);
				return res.json({'id': deployment.id});
			}).catch(error => {
				return validationError(error, next);
			});
		}).
		catch( error => {
			log.debug('Deployment error', error);
			res.status(500);
			res.json({error: error});
		});
};

var getCommonDenominatorStatus = function(deploymentStatuses) {
	var result = STATUS_UNKNOWN;
	for(var pipeElementStatus of deploymentStatuses) {
		if(pipeElementStatus.status === STATUS_FAILED) {
			/* if one element failed, the entire pipe deployment is failed */
			return STATUS_FAILED;
		}
		if(pipeElementStatus.status === STATUS_DEPLOYED) {
			/* set the DEPLOYED status */
			result = pipeElementStatus.status;
		} else if(pipeElementStatus.status === STATUS_NOT_DEPLOYABLE) {
			/* only set this if we haven't seen a DEPLOYED status before */
			if(result === STATUS_UNKNOWN) {
				result = pipeElementStatus.status;
			}
		}
	}
	return result;
}

exports.input = function(req, res, next) {
	var user = auth.getCurrentUser(req);
	var pipeID = req.params.pipeID;
	var inputID = req.params.inputID;
	Pipe.findByIdQ(pipeID).then(pipe => {
		if (!pipe) {
			return next(errors.NotFoundError('Pipe not found for ID ' + pipeID));
		}
		pipe[PIPE_ELEMENTS].forEach(function(pipeEl) {
			if(pipeEl[ID] == inputID) {
				var url = getUrlForInputNode(user, pipe, pipeEl);
				log.debug('POSTing test data to:', url);
				var client = new Client();
				var args = {
					data: req.body,
					headers:{'Content-Type': 'application/json'} 
				};
				var inputReq = client.post(url, args, function(data, response) {
					res.send(data);
				});
				inputReq.on('error', function(err) {
				    log.warn('Unable to POST data to pipe input', url);
				});
			}
		});
	}).catch(error => {
		log.error('Cannot POST input data to pipe: ', error);
		return next(errors.InternalError('Cannot POST input data to pipe', error));
	});
};

exports.listAll = function (req, res, next) {
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

exports.delete = function (req, res, next) {

	let id = req.params.id;
	log.debug('Deleting deployment with id %s', id);
	var deployer = new Deployer();

	PipeDeployment.findByIdQ(id)
		.then( deployment => {
			return deployer.undeploy(deployment);
		})
		.then( status => {
			log.debug('Status: ', status);
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



/* HELPER METHODS */

var getUrlForInputNode = function(user, pipe, pipeEl) {
	var orgID = user.getDefaultOrganization()[ID];
	var connector = new Connector();
	var id = connector.getServiceNameForPipeElement(pipeEl);
	return 'http://' + id + '.' + process.env.RIOX_ENV +
			'.svc.cluster.local:' + pipeEl[PARAMS].port + '/messages';
};

var validationError = function (err, next) {
	return next(errors.UnprocessableEntity('You passed a broken object', err));
};
