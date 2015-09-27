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
		if(!hostname) hostname = config.springxdadmin.hostname;
		if(!port) port = config.springxdadmin.port;
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
		log.debug("SpringCDFDeployer.deploy: ", pipe.id);
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
		var deployStatus = modulez(this.connector, args, this.user);
		promises.push(deployStatus);

		// create connectors
		for(var edge of edgesOut) {
			var queueIn = "queue:" + edge.source + "-out";
			var queueOut = "queue:" + edge.target + "-in";

			//var streamDef = queueIn + " > " + queueOut;
			/* TODO: "transform"s required because direct bridging between queues is currently not supported */
			var streamDef = queueIn + " > t1: transform | t2: transform > " + queueOut;

			var streamId = "edge-" + edge.source + "-to-" + edge.target;
			var linkDeployStatus = this.connector.createStream(streamId, streamDef);
			/* add promise results to status array */
			promises.push(linkDeployStatus);
		}

		promises.forEach(function(prom) {
			prom = prom.then(stream => {
				var result = {};
				result[ID] = element[ID];
				result[STATUS] = stream[STATUS];
				result["springcdf"] = stream;
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

};

module.exports = SpringCDFDeployer;
