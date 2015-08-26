'use strict';

var log = global.log || require('winston');
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
Promise.promisifyAll(request);
var util = require('util');

log.level = 'debug' // TODO remove

const STATUS_DEPLOYING = 'deploying';
const STATUS_DEPLOYED = 'deployed';
const STATUS_FAILED = 'failed';
const STATUS_UNDEPLOYED = 'undeployed';

class SpringXdConnector {

	constructor(hostname, port) {
		this.baseUrl = util.format('http://%s:%d', hostname, port);
		this.streamsUrl = this.baseUrl + '/streams/definitions';
		this.streamDeploymentsUrl = this.baseUrl + '/streams/deployments';
	}

	waitForStreamStatus(streamName, retries) {
		log.debug('springxd.connector.waitForStreamStatus: %s', streamName);
		if (typeof retries == undefined) {
			retries = 5;
		}
		if (retries < 0) {
			let msg = util.format('Failed to wait for stream \'%s\' status (timeout).', streamName);
			log.warn(msg);
			return Promise.reject(msg);
		}
		return this.findStream(streamName)
			.then( stream => {
				if (stream && stream.status === STATUS_DEPLOYING) {
					return Promise.delay(2000).then(this.waitForStreamStatus(streamName, retries - 1));
				} else {
					return stream;
				}
			});
	};


	createStream(streamName, streamDefinition) {
		log.debug('springxd.connector.createStream: %s', streamName);

		log.debug('String XD endpoint: ', this.streamsUrl);
		log.info('Creating XD stream ' + streamName + ' with definition: ' + streamDefinition);

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
				}
			})
			.catch( err => {
				log.debug('Error deploying stream: ', err);

				// TODO we may also end up here with a failure where redeploy could help
				// E.g.: Error: read ECONNRESET
				//at exports._errnoException (util.js:746:11)
				//at TCP.onread (net.js:559:26)

				return this.findStream(streamName)
					.then( stream => {
						log.info('springxd.connector.createStream: %s exists. Updating!', streamName);
						// log.info(stream);
						// TODO check if existing stream definition is identical to requested one
						// TODO FR we should update the stream
					});
					// .catch(function (err) {
					// 	var errMsg = util.format('Unable to create or find stream \'%s\': %s', streamName, JSON.stringify(err));
					// 	return errMsg;
					// });

			});
	};

	undeployStream(streamName) {
		log.info('Undeploying XD stream \'%s\'', streamName);

		let url = this.streamDeploymentsUrl + '/' + streamName;
		log.debug('Undeploy request url: ', url);

		return request.delAsync(url)
			.then( () => {
				return this.waitForStreamStatus(streamName);
			})
			.then(stream => {
				if(stream.status == STATUS_UNDEPLOYED) {
					return stream;
				} else {
					return Promise.reject(stream);
				}
			});
	};

	deployStream(streamName) {
		log.info('Deploying XD stream \'%s\'', streamName);
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
		log.info('springxd.connector.redeployStream: ', streamName);
		if (typeof retries == 'undefined') {
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

	findStream(xdStreamId) {
		let url = this.streamsUrl + '/' + xdStreamId;

		return new Promise(function (resolve, reject) {
			log.info('springxd.connector.findStream: ', xdStreamId);

			request.getAsync(url).spread( (response, body) => {
				log.debug('springxd.connector.findStream - body: ', body);
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
				log.warn('springxd.connector.findStream - error: ', e.message);
				reject(e);
			});
		});
	};

	deleteStream(streamName) {
		log.info('Deleting XD stream \'%s\'', streamName);

		let url = this.streamsUrl + '/' + streamName;
		log.debug('Delete request url: ', url);

		return request.delAsync(url).spread( (response, body) => {
			return body;
		});
	};

};

module.exports = SpringXdConnector;
