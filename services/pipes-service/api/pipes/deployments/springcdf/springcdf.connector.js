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
		log.debug('springcdf.connector.waitForStreamStatus: %s', streamName);
		if (typeof retries == "undefined") {
			retries = 5;
		}
		if (retries < 0) {
			let msg = util.format('Failed to wait for stream \'%s\' status (timeout).', streamName);
			log.warn(msg);
			return Promise.reject(msg);
		}
		var thisInst = this;
		return this.findStream(streamName)
			.then( stream => {
				if (stream && stream.status === STATUS_DEPLOYING) {
					return Promise.delay(2000).then(function() {
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

		var params = {form: {name: streamName, definition: streamDefinition }};

		return request.postAsync(this.streamsUrl, params)
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
					log.warn("Unexpected status of stream " + streamName + ":", stream.status)
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

	/**
	 * Find a stream with a given ID.
	 * Note: currently we need to get the full list and iterate through items (see also 'findStreamDirect' below).
	 */
	findStream(streamId) {
		let url = this.streamsUrl + "?page=0&size=500";

		return new Promise(function (resolve, reject) {
			log.info('springcdf.connector.findStream: ', streamId);

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
			log.info('springcdf.connector.findStream: ', streamId);

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
