'use strict';

var log = global.log || require('winston');
var util = require('util');
var Promise = require('bluebird');
var	auth = require('riox-services-base/lib/auth/auth.service');
var SpringXdConnector = require('./springxd.connector');

/**
 * Deploys a Riox Smart Data Pipeline to Spring XD. It takes the pipe
 * definition as the input and deploys to a certain 'environment'.
 */
class SpringXdDeployer {

	constructor(hostname, port) {
		log.debug("SpringXdDeployer.constructor");
		if(!hostname) hostname = config.springxdadmin.hostname;
		if(!port) port = config.springxdadmin.port;
		this.xdConnector = new SpringXdConnector(hostname, port);
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
		log.debug("SpringXdDeployer.deploy: ", pipe.id);
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
		log.debug("SpringXdDeployer.undeploy: ", pipeDeployment.id);
		return Promise.map(pipeDeployment[STATUS], status => {
			log.debug("SpringXdDeployer.undeploy.status: ", JSON.stringify(status));
			return this.xdConnector.deleteStream(status.springxd.name);
		});
	};

	//
	// PRIVATE methods
	//

	_deployAll(pipe, environment, deploymentStatus) {
		//console.log("deploy all");
		for(var el of pipe[PIPE_ELEMENTS]) {
			//console.log("deploy single", el);
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
						target: tgt
					});
				}
			}
		}
		return result;
	}

	_getOutgoingEdges(pipe, element) {
		var result = [];
		for(var tgt of element[EDGES_OUT]) {
			result.push({
				source: element[ID],
				target: tgt
			});
		}
		return result;
	}

	_deploySingle(pipe, environment, element, edgesIn, edgesOut, deploymentStatus) {
		// dynamically load modules
		var moduleName = util.format("./mapping/%s/%s", element[CATEGORY], element[TYPE]);
		log.debug("Loading module name: ", moduleName);

		try {
			var modulez = require(moduleName);
		} catch (e) {
			deploymentStatus.push(Promise.reject("Cannot find module for pipe element type " + element[CATEGORY] + "/" + element[TYPE]));
			return;
		}

		var args = {};
		args[ID] = element.id;
		args[PARAMS] = element[PARAMS];
		args["environment"] = environment;
	
		var necessaryConnections = [];

		if(edgesOut.length > 0) {
			args["next_id"] = element.id + "-out";
		}

		if(edgesIn.length > 0) {
			args["previous_id"] = element.id + "-in";
		}

		log.debug("Module arguments: ", args);
	
		var promises = [];

		// create module
		var deployStatus = modulez(this.xdConnector, args);
		promises.push(deployStatus);

		// create connectors
		for(var edge of edgesOut) {
			var queueIn = "queue:" + edge.source + "-out";
			var queueOut = "queue:" + edge.target + "-in";
			var streamDef = queueIn + " > " + queueOut;
			var streamId = edge.source + "-to-" + edge.target;
			var linkDeployStatus = this.xdConnector.createStream(streamId, streamDef);
			/* add promise results to status array */
			promises.push(linkDeployStatus);
		}

		promises.forEach(function(prom) {
			prom = prom.then(stream => {
				var result = {};
				result[ID] = element[ID];
				result[STATUS] = stream[STATUS];
				result["springxd"] = stream;
				return result;
			})
			.catch(error => {
				var result = {};
				result[ID] = element[ID];
				result[STATUS] = 'failed';
				result["springxd"] = error;
				return result;
			});
			/* add promise results to status array */
			deploymentStatus.push(prom);
		});

	}

	/**
	 * Finds the next id according to our pipeline semantics (i.e., it needs
	 * to be in the same position in case it is a container).
	 */
	_nextId(pipe, index, subindex) {
		let elem = pipe.elements[index+1];
		if (elem) {
			if (elem.class === 'container') { // TODO make a symbol
				return elem.elements[subindex].uuid; // TODO do we need to check subindex
			}
			return elem.uuid;
		}
		return undefined;
	}


	/**
	 * Recursively loops over a pipe definition and deploys all elements.
	 * @Deprecated - use _deployAll(..) instead.
	 */
//	_deployRecursive(pipe, environment, deploymentStatus, index, depth) {
//		for (var i = 0; i < pipe.elements.length; i ++) {
//			let element = pipe.elements[i];
//
//			if (element.class === 'container') {
//				// let subStatus = [];
//				depth = depth + 1;
//				// TODO enable this if we want status to have same strucutre as pipe
//				// this._deployRecursive(element, environment, subStatus, index, depth);
//				this._deployRecursive(element, environment, deploymentStatus, index, depth);
//				depth = depth - 1;
//				// TODO enable this if we want status to have same strucutre as pipe
//				// deploymentStatus.push(subStatus);
//			} else {
//				// store deployment info as flat list
//				deploymentStatus.push(this._deployModule(pipe, environment, element, index, i));
//
//				// TODO enable this if we want status to have same strucutre as pipe
//				// deploymentStatus.push(status);
//			}
//
//			if (depth === 0) // only increase block index when we are not in the recursion (i.e., not processing a container)
//				index = index + 1;
//		}
//	}

	/**
	 * Deploys a single element of the SDP.
	 *
	 * @returns a object with the UUID of the element, the deployment status
	 * and the springxd deployment information.
	 * 
	 * @Deprecated
	 */
//	_deployModule(pipe, environment, element, index, subindex) {
//		// dynamically load modules
//		var moduleName = util.format("./mapping/%s/%s", element[CATEGORY], element[TYPE]);
//		log.debug("Loading module name: ", moduleName);
//		console.log("==>", element);
//		var modulez = require(moduleName);
//
//		var args = {};
//		args[ID] = element.id;
//		args[PARAMS] = element[PARAMS];
//		args["previous_id"] = element.id;
//		args["next_id"] = this._nextId(this.pipe, index, subindex);
//		args["environment"] = environment;
//
//		log.debug("Module arguments: ", args);
//
//		// execute modules
//		return modulez(this.xdConnector, args)
//			.then(stream => {
//				return {
//					 "uuid" : element.uuid, // TODO leverage constants here
//					 "status" : stream.status,
//					 "springxd" : stream
//				}
//			})
//			.catch(error => {
//				return {
//					"uuid" : element.uuid, // TODO leverage constants here
//					"status" : 'failed',
//					"springxd" : error
//				}
//			});
//	}

};

module.exports = SpringXdDeployer;
