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

	constructor(pipe) {
		log.debug("SpringXdDeployer.create: ", pipe.id);
		this.pipe = pipe;
		this.xdConnector = new SpringXdConnector(config.springxdadmin.hostname,
																						config.springxdadmin.port);
	}

	//
	// PUBLIC method
	//

	/*
	 * Applies the pipe defintion to a particular environment.
	 *
	 * @return a promise array of all elements and their status.
	 */
	apply(environment) {
		log.debug("SpringXdDeployer.apply: ", this.pipe.id);
		this.deploymentStatus = [];
		this._deployRecursive(this.pipe, environment, this.deploymentStatus, 0, 0);
		return Promise.all(this.deploymentStatus)
	};

	//
	// PRIVATE method
	//
	_deployRecursive(pipe, environment, deploymentStatus, index, depth) {
		for (var i in pipe.elements) {
			let element = pipe.elements[i];

			// reset index within each container -- not sure why let i does that ;)
			if (depth === 0) {
				i = -1;
			}

			if (element.class === 'container') {
				let subStatus = [];
				depth = depth + 1;
				this._deployRecursive(element, environment, subStatus, index, depth);
				depth = depth - 1;
				// TODO enable this if we want status to have same strucutre as pipe
				// deploymentStatus.push(subStatus);
			} else {
				// store deployment info as flat list
				this.deploymentStatus.push(this._deployModule(environment, element, index, i));

				// TODO enable this if we want status to have same strucutre as pipe
				// deploymentStatus.push(status);
			}

			if (depth === 0) // only increase block index when we are not in the recursion (i.e., not processing a container)
				index = index + 1;
		}
	}

	/*
	 * Deploys a single element of the SDP.

	 * @returns a object with the UUID of the element, the deployment status
	 * and the springxd deployment information.
	 */
	_deployModule(environment, element, index, subindex) {
		// dynamically load modules
		var moduleName = util.format("./mapping/%s/%s", element['type'], element['subtype']);
		log.debug("Loading module name: ", moduleName);
		var modulez = require(moduleName);

		var args = { // TODO leverage constants here
				// "dryrun" : true,
				"id": element.uuid,
				"previous_id" : element.uuid,
				"next_id" : this._nextId(index, index, subindex),
				options : element.options,
				"environment" : environment
		};

		log.debug("Module arguments: ", args);

		// execute modules
		return modulez(this.xdConnector, args)
			.then(stream => {
				return {
					 "uuid" : element.uuid, // TODO leverage constants here
					 "status" : stream.status,
					 "springxd" : stream
				}
			})
			.catch(error => {
				return {
					"uuid" : element.uuid, // TODO leverage constants here
					"status" : 'failed',
					"springxd" : error
				}
			});
	}

	/*
	 * Finds the next id according to our pipeline semantics (i.e., it needs
	 * to be in the same position in case it is a container).
	 */
	_nextId(pipe, index, subindex) {
		let elem = this.pipe.elements[index+1];
		if (elem) {
			if (elem.class === 'container') { // TODO make a symbol
				return elem.elements[subindex].uuid; // TODO do we need to check subindex
			}
			return elem.uuid;
		}
		return undefined;
	}

};

module.exports = SpringXdDeployer;
