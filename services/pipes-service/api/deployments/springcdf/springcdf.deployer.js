'use strict';

var log = global.log || require('winston');
var util = require('util');
var Promise = require('bluebird');
var	auth = require('riox-services-base/lib/auth/auth.service');
var SpringCDFConnector = require('./springcdf.connector');

/**
 * Deploys a Riox Smart Data Pipeline to Spring CDF. It takes the pipe
 * definition as the input and deploys to a certain 'environment'.
 */
class SpringCDFDeployer {

	constructor(hostname, port, user) {
		log.debug("SpringCdfDeployer.constructor");
		if(!hostname) throw "Invalid hostname provided for CDF Admin: " + hostname;
		if(!port) throw "Invalid port provided for CDF Admin: " + port;
		this.connector = new SpringCDFConnector(hostname, port);
		this.user = user;
	}

	//
	// PUBLIC methods
	//

	/**
	 * Deploys the pipe defintion to a particular environment.
	 *
	 * @return a promise array of all elements and their status.
	 */
	deploy(pipe, environment) {
		log.debug("SpringCDFDeployer.deploy:", pipe.id, environment);
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
		log.debug("SpringCDFDeployer.undeploy: ", pipeDeployment.id);
		return Promise.map(pipeDeployment[STATUS], status => {
			log.debug("SpringCDFDeployer.undeploy.status: ", JSON.stringify(status));
			return this.cdfConnector.deleteStream(status.springcdf.name);
		});
	};

	//
	// PRIVATE methods
	//

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
		// dynamically load modules
		var moduleName = util.format("./mapping/%s/%s", element[CATEGORY], element[TYPE]);
		log.debug("Loading module name: ", moduleName);

		var useDirectEdgesToOptimizeDeployment = true;

		try {
			var modulez = require(moduleName);
		} catch (e) {
			deploymentStatus.push(Promise.reject("Cannot find module for pipe element type " + element[CATEGORY] + "/" + element[TYPE]));
			return;
		}

		var args = {};
		args[ID] = element.id;
		args[PARAMS] = element[PARAMS];
		args[ENVIRONMENT] = environment;
		args[PIPE_ID] = pipe[ID];

		var necessaryConnections = [];

		var edgeConnectedDirectly = false;
		if(edgesOut.length > 0) {
			if(useDirectEdgesToOptimizeDeployment && edgesOut.length == 1) {
				//var nextInEdges = this._getIncomingEdges(pipe, edgesOut[0].targetNode);
				args["next_id"] = edgesOut[0].target + "-in";
				edgeConnectedDirectly = true;
			} else {
				args["next_id"] = element.id + "-out";
			}
		}

		if(edgesIn.length > 0) {
			args["previous_id"] = element.id + "-in";
		}

		//log.debug("Module arguments: ", args);
	
		var promises = [];

		/* create module */
		var deployStatus = modulez(this.connector, args, this.user);

		if(deployStatus) {

			/* add promise to promises array */
			promises.push(deployStatus);

			/* create connectors, but ONLY if the outgoing edge has not been connected directly */
			if(!edgeConnectedDirectly) {

				/* create connectors */
				for(var edge of edgesOut) {
	
					/* 
					 * let's see if we need to add this edge. some edges point to nodes which are not
					 * represented by SCDF streams (e.g., map/chart visualizations, comment nodes, etc.), 
					 * hence we also don't need to add the edges.
					 */
					if(! this.connector.isActualPipeElement(edge.targetNode)) {
						/* skip this edge */
					} else {
						/* add this edge */
	
						var queueIn = "queue:" + edge.source + "-out";
						var queueOut = "queue:" + edge.target + "-in";
	
						//var streamDef = queueIn + " > " + queueOut;
						/* TODO: two "transform"s required because direct bridging between queues is currently not supported :/ */
						var streamDef = queueIn + " > t1: transform | t2: transform > " + queueOut;
	
						var streamId = "edge-" + edge.source + "-to-" + edge.target;
						var linkDeployStatus = this.connector.createStream(streamId, streamDef);
						/* add promise results to status array */
						promises.push(linkDeployStatus);
					}
				}

			}

			promises.forEach(function(prom) {
				function addProm(p) {
					p = p.then(stream => {
						var result = {};
						result[ID] = element[ID];
						result[STATUS] = stream[STATUS];
						result["springcdf"] = stream;
						//console.log("==> result.status", result[ID], result[STATUS]);
						return result;
					})
					.catch(error => {
						var result = {};
						result[ID] = element[ID];
						result[STATUS] = 'failed';
						result["springcdf"] = error;
						return Promise.reject(result);
					});
					/* add promise results to status array */
					deploymentStatus.push(p);
				}
				addProm(prom);
			});
		}

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

module.exports = SpringCDFDeployer;
