'use strict';

var log = global.log || require('winston');
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
Promise.promisifyAll(request);
var util = require('util');

log.level = 'debug' // TODO remove this once the tests are fixed.

const STATUS_DEPLOYING = 'deploying';
const STATUS_DEPLOYED = 'deployed';
const STATUS_FAILED = 'failed';
const STATUS_UNDEPLOYED = 'undeployed';
const STATUS_UNKNOWN = 'unknown';

class SpringCDFConnector {

	constructor(hostname, port) {
		this.baseUrl = util.format('http://%s:%d', hostname, port);
		this.streamsUrl = this.baseUrl + '/streams/definitions';
		this.streamDeploymentsUrl = this.baseUrl + '/streams/deployments';
	}

	waitForStreamStatus(streamName, retries) {
		var repeatDelay = 5000;
		log.debug('springcdf.connector.waitForStreamStatus: %s', streamName);
		if (typeof retries == "undefined") {
			retries = 30;
		}
		if (retries < 0) {
			let msg = util.format('Failed to wait for stream \'%s\' status (timeout).', streamName);
			log.warn(msg);
			return Promise.reject(msg);
		}
		var thisInst = this;
		return this.findStream(streamName)
			.then( stream => {
				if (stream && [STATUS_DEPLOYING, STATUS_UNKNOWN].indexOf(stream.status) >= 0) {
					return Promise.delay(repeatDelay).then(function() {
						return thisInst.waitForStreamStatus(streamName, retries - 1);
					});
				} else {
					return stream;
				}
			});
	};

	createStream(streamName, streamDefinition) {
		log.debug('springcdf.connector.createStream: %s', streamName);

		log.debug('String CDF endpoint: ', this.streamsUrl);
		log.info('Creating CDF stream ' + streamName + ' with definition: ' + streamDefinition);

		var params = {form: {name: streamName, definition: streamDefinition, deploy: false}};

		/* first, create stream *without* deploying it */
		return request.postAsync(this.streamsUrl, params)
			.then( () => {
				/* second, deploy the stream with custom deployment properties */
				var deployURL = this.streamDeploymentsUrl + "/" + streamName;
				var params = {form: {properties: "module.*.java_tool_options=-Xms64m -Xmx64m"}};
				return request.postAsync(deployURL, params);
			})
			.then( () => {
				return this.waitForStreamStatus(streamName);
			})
			.then( (stream) => {
				if (stream.status == STATUS_DEPLOYED) {
					log.info('Stream deployed successfully:', streamName);
					return stream;
				} else if (stream.status == STATUS_FAILED) {
					log.error('Unable to create stream \'%s\' (deploy failed). re-deploying!', streamName);
					return this.redeployStream(streamName);
				} else {
					log.warn("Unexpected status of stream " + streamName + ":", stream.status);
				}
			})
			.catch( err => {
				//log.debug('Error deploying stream: ', err);

				return this.findStream(streamName)
					.then( stream => {
						log.info('springcdf.connector.createStream: %s exists. Updating!', streamName);
						// log.info(stream);
						// TODO check if existing stream definition is identical to requested one
						// TODO FR we should update the stream
					})
					.catch(function (err) {
						var errMsg = util.format('Unable to create or find stream \'%s\': %s', streamName, JSON.stringify(err));
						log.debug(errMsg);
						return Promise.reject(errMsg);
					});
			});

	};

	undeployStream(streamName, retries) {
		log.info('Undeploying CDF stream \'%s\' with retries %s', streamName, retries);

		if (typeof retries == "undefined") {
			retries = 3;
		}
		if (retries < 0) {
			let msg = util.format('Failed to undeploy stream \'%s\'.', streamName);
			log.warn(msg);
			return Promise.reject(msg);
		}

		let url = this.streamDeploymentsUrl + '/' + streamName;
		log.debug('Undeploy request url: ', url);
		var thisInst = this;

		return request.delAsync(url)
			.then( res => {
				if(res[0] && res[0].statusCode && res[0].statusCode >= 500) {
					var body = res[0].body;
					if(typeof body === "string") {
						body = JSON.parse(body);
					}
					if( Object.prototype.toString.call(body) === '[object Array]' ) {
					    body = body[0];
					}
					/* invalid stream name provided? */
					if(body.logref == "IllegalArgumentException") {
						return Promise.reject(body);
					}
					/* --> retry */
					return Promise.delay(6000).then(function() {
						return thisInst.undeployStream(streamName, retries - 1);
					});
				}
				return this.waitForStreamStatus(streamName);
			})
			.then(stream => {
				if(stream.status == STATUS_UNDEPLOYED || stream.status == STATUS_UNKNOWN) {
					return stream;
				} else {
					return Promise.reject(stream);
				}
			});
	};

	deployStream(streamName) {
		log.info('Deploying CDF stream \'%s\'', streamName);
		let url = this.streamDeploymentsUrl + '/' + streamName;

		return request.postAsync(url)
			.then( () => {
				return this.waitForStreamStatus(streamName);
			})
			.then(stream => {
				if (stream.status == STATUS_DEPLOYED) {
					return stream;
				} else {
					return Promise.reject(stream);
				}
			});
	};

	redeployStream(streamName, retries) {
		log.info('springcdf.connector.redeployStream: ', streamName);
		if (typeof retries == "undefined") {
			retries = 5;
		}
		if (retries < 0) {
			let msg = util.format('Failed to re-deploy stream \'%s\'.', streamName);
			log.error(msg);
			return Promise.reject(msg);
		}
		return this.undeployStream(streamName)
			.then( () => {
				return this.deployStream(streamName);
			})
			.catch( () => {
				return this.redeployStream(streamName, retries - 1);
			});
	};

	/*
	 * Some elements in our pipelines are sort of "dummy nodes" which are
	 * visible to the user in the pipeline, but not actually deployed to 
	 * Spring CDF (e.g., map/chart visualization nodes, comment nodes, ...).
	 * 
	 * This method determines whether a given pipe element is an actual pipe 
	 * element that is deployed to CDF or not.
	 */
	isActualPipeElement(pipeEl) {
		var IGNORE_NODES = ["geo-map", "chart"];

		if(pipeEl[CATEGORY] == "sink" && IGNORE_NODES.indexOf(pipeEl[TYPE]) >= 0) {
			return false;
		}
		return true;
	}

	getStreamIdForPipeElement(pipeEl, environment) {
		environment = environment || pipeEl[ENVIRONMENT];
		/* NOTE: we should only use dashes as separators here, otherwise 
		 * the kubernetes SCDF deployer runs into this problem: 
		 * EditableObjectMeta name:must match "^[a-z0-9]([-a-z0-9]*[a-z0-9])?$"
		 */
		var id = environment + "-" + pipeEl[PIPE_ID] + "-" + pipeEl[ID];
		/*
		 * NOTE: IDs must be in lowercase
		 */
		id = id.toLowerCase();
		/*
		 * NOTE: IDs must be at most 24 characters (DNS 952 label). 
		 * Truncate right-to-left, since we assume that the pipe element ID is unique. 
		 * This may reduce readability of the truncated IDs, but preserves uniqueness.
		 */
		id = id.slice(-24);
		//console.log("Stream ID '" + id + "' for", pipeEl);

		// TODO tmp - remove!
		id = "x" + pipeEl[ID] + "x";

		return id;
	}

	findStreamForPipeElement(pipeEl, environment) {
		var streamId = this.getStreamIdForPipeElement(pipeEl, environment);
		return this.findStream(streamId);
	}

	/**
	 * Find a stream with a given ID.
	 * Note: currently we need to get the full list and iterate through items (see also 'findStreamDirect' below).
	 */
	findStream(streamId) {
		let url = this.streamsUrl + "?page=0&size=500";

		return new Promise(function (resolve, reject) {
			//log.info('springcdf.connector.findStream: ', streamId);

			request.getAsync(url).spread( (response, body) => {
				let json = JSON.parse(body);
				// FR: there is an open bug in bluebird b/c a 404 should actually be REJECTED and not resolved.
				if (response.statusCode == 404) {
					if (json.length > 0)
						reject(json[0]);
					else
						reject(json);
				} else {
					if(json._embedded) {
						var entries = json._embedded.streamDefinitionResourceList;
						for(var i = 0; i < entries.length; i ++) {
							var stream = entries[i];
							if(stream.name == streamId) {
								return resolve(stream);
							}
						}
					}
					log.warn("Cannot find stream: " + streamId);
					reject({error: "Cannot find stream: " + streamId, logref: "NoSuchDefinitionException"});
				}
			}).catch(e => {
				log.warn('springcdf.connector.findStream - error: ', e.message);
				reject(e);
			});
		});
	};

	/**
	 * Directly access API with stream ID: http://<host>:9393/definitions/<streamId>
	 * NOTE: method currently not supported/implemented in spring cloud data flow!
	 * Track status here:
	 * https://github.com/spring-cloud/spring-cloud-dataflow/blob/master/spring-cloud-dataflow-admin/src/main/java/org/springframework/cloud/dataflow/admin/controller/StreamController.java
	 */
	findStreamDirect(streamId) {
		let url = this.streamsUrl + '/' + streamId;

		return new Promise(function (resolve, reject) {
			//log.info('springcdf.connector.findStream: ', streamId);

			request.getAsync(url).spread( (response, body) => {
				log.debug('springcdf.connector.findStream - body: ', body);
				let json = JSON.parse(body);
				// FR: there is an open bug in bluebird b/c a 404 should actually be REJECTED and not resolved.
				if (response.statusCode == 404) {
					if (json.length > 0)
						reject(json[0]);
					else
						reject(json);
				} else {
					resolve(json);
				}
			}).catch(e => {
				log.warn('springcdf.connector.findStream - error: ', e.message);
				reject(e);
			});
		});
	};

	deleteStream(streamName) {
		log.info('Deleting CDF stream \'%s\'', streamName);

		let url = this.streamsUrl + '/' + streamName;
		log.debug('Delete request url: ', url);

		return request.delAsync(url).spread( (response, body) => {
			if(response.statusCode == 200) {
				return { name: streamName };
			}
			return undefined;
		});
	};

};

module.exports = SpringCDFConnector;
