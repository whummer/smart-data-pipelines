'use strict';

var log = global.log || require('winston');
var util = require('util');
var Promise = require('bluebird');
var	auth = require('riox-services-base/lib/auth/auth.service');
var Connector = require('./k8s.connector');

/**
 * Deploys a Riox Smart Data Pipeline to Spring K8S. It takes the pipe
 * definition as the input and deploys to a certain 'environment'.
 */
class K8SDeployer {

	constructor(configs) {
		configs = configs || {};
		this.connector = new Connector();
		this.user = configs.user;
	}

	/*
	 * PUBLIC methods
	 */

	/**
	 * Deploys the pipe defintion to a particular environment.
	 *
	 * @return a promise array of all elements and their status.
	 */
	deploy(pipe, environment) {
		log.debug("Deployer.deploy:", pipe.id, environment);
		let deploymentStatus = [];
		this.pipe = pipe;
		this._deployAll(this.pipe, environment, deploymentStatus);
		return Promise.all(deploymentStatus);
	};

	/**
	 * Undeploys the pipe defintion to a particular environment.
	 *
	 * @return a promise array of all elements and their status.
	 */
	undeploy(pipeDeployment) {
		log.debug("Deployer.undeploy: ", pipeDeployment[ID]);
		// TODO remove
//		return Promise.map(pipeDeployment[PIPE_ELEMENTS], status => {
//			log.debug("Deployer.undeploy.container: ", status[ID]);
//			return this.connector.removeContainers(status);
//		});
		return this.connector.removeEntirePipeDeployment(pipeDeployment);
	};

	/* 
	 * PRIVATE methods
	 */

	_deployAll(pipe, environment, deploymentStatus) {
		for(var el of pipe[PIPE_ELEMENTS]) {
			var edgesIn = this._getIncomingEdges(pipe, el);
			var edgesOut = this._getOutgoingEdges(pipe, el);
			this._deploySingle(pipe, environment, el, edgesIn, edgesOut, deploymentStatus);
		}
	}

	_getIncomingEdges(pipe, element) {
		var result = [];
		for(var el of pipe[PIPE_ELEMENTS]) {
			for(var tgt of el[EDGES_OUT]) {
				if(tgt == element[ID]) {
					result.push({
						source: el[ID],
						target: tgt,
						targetNode: element
					});
				}
			}
		}
		return result;
	}

	_getOutgoingEdges(pipe, element) {
		var result = [];
		for(var tgt of element[EDGES_OUT]) {
			var tgtEl = this._findPipeElement(pipe, tgt);
			result.push({
				source: element[ID],
				target: tgt,
				targetNode: tgtEl
			});
		}
		return result;
	}

	_deploySingle(pipe, environment, element, edgesIn, edgesOut, deploymentStatus) {
		var self = this;
		var useDirectEdgesToOptimizeDeployment = true;

		/* dynamically load modules */
		var moduleName = util.format("./mapping/%s/%s", element[CATEGORY], element[TYPE]);

		try {
			var modulez = require(moduleName);
		} catch (e) {
			deploymentStatus.push(Promise.reject("Cannot find module for pipe element type " + element[CATEGORY] + "/" + element[TYPE]));
			return;
		}

		var args = {};
		args[ID] = element[ID];
		args[PARAMS] = element[PARAMS];
		args[CATEGORY] = element[CATEGORY];
		args[TYPE] = element[TYPE];
		args[ENVIRONMENT] = environment;
		args[PIPE_ID] = pipe[ID];

		var necessaryConnections = [];

		var edgeConnectedDirectly = false;
		if(edgesOut.length > 0) {
			if(useDirectEdgesToOptimizeDeployment && edgesOut.length == 1) {
				args["next_id"] = edgesOut[0].target + "-in";
				edgeConnectedDirectly = true;
			} else {
				args["next_id"] = element.id + "-out";
			}
		}

		if(edgesIn.length > 0) {
			args["previous_id"] = element.id + "-in";
		}

		var promises = [];

		/* create module definition */
		var getContainerDefinitions = modulez(args, this.user);

		/* start module deployment */
		var deployStatus = getContainerDefinitions.then(function(containersToDeploy) {
			for(var cont of containersToDeploy) {
				if(!cont.pipeElement) cont.pipeElement = args;
			}
			return self.connector.deployContainers(containersToDeploy);
		});

		/* add promise to promises array */
		promises.push(deployStatus);

		/* create connectors, but ONLY if the outgoing edge has not been connected directly */
		if(!edgeConnectedDirectly) {

			/* create connectors */
			for(var edge of edgesOut) {

				/* 
				 * let's see if we need to add this edge. some edges point to nodes which are not
				 * represented by pipe elements (e.g., map/chart visualizations, comment nodes, etc.), 
				 * hence we also don't need to add the edges.
				 */
				if(! this.connector.isActualPipeElement(edge.targetNode)) {
					/* skip this edge */
				} else {
					/* add this edge */

					var moduleImport = require("./mapping/processor/bridge");
					var linkDeployStatus = moduleImport(element, edge.targetNode).then(function(containers) {
						var pipeEl = containers[0].pipeElement;
						if(!pipeEl[PIPE_ID]) {
							pipeEl[PIPE_ID] = pipe[ID];
						}
						if(!pipeEl[ENVIRONMENT]) {
							pipeEl[ENVIRONMENT] = environment;
						}
						return self.connector.deployContainers(containers);
					});
					/* add promise results to status array */
					promises.push(linkDeployStatus);
				}
			}
		}

		promises.forEach(function(p) {
			p = p.then(stream => {
				var result = {};
				result[ID] = stream[ID] || element[ID];
				result[STATUS] = stream[STATUS];
				if(result[STATUS] === STATUS_RUNNING) {
					result[STATUS] = STATUS_DEPLOYED;
				}
				result[DETAILS] = stream;
				return result;
			})
			.catch(error => {
				var result = {};
				result[ID] = error[ID] || element[ID];
				result[STATUS] = STATUS_FAILED;
				result[DETAILS] = error;
				return Promise.reject(result);
			});
			/* add promise results to status array */
			deploymentStatus.push(p);
		});
	}

	/**
	 * Finds a pipe element by ID.
	 */
	_findPipeElement(pipe, elementID) {
		for(var el of pipe[PIPE_ELEMENTS]) {
			if(elementID == el[ID]) {
				return el;
			}
		}
		log.warn("Unable to find pipe element with ID '" + elementID + "'");
		return null;
	}

	
};

module.exports = K8SDeployer;
