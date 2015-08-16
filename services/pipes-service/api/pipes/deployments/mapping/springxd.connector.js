'use strict';

var log = global.log || require('winston');
var Promise = require("bluebird");
var request = Promise.promisify(require("request"));
Promise.promisifyAll(request);
var util = require('util');

//log.level = 'debug'

var x = exports;
var STATUS_DEPLOYING = "deploying";
var STATUS_DEPLOYED = "deployed";
var STATUS_FAILED = "failed";
var STATUS_UNDEPLOYED = "undeployed";


function getBaseURL() {
	return "http://" + config.springxdadmin.hostname + ":" + config.springxdadmin.port;
}
function getStreamsURL() {
	return getBaseURL() + "/streams/definitions";
}
function getStreamDeploymentsURL() {
	return getBaseURL() + "/streams/deployments";
}
function clientError(e) {
	return e.code >= 400 && e.code < 500;
}


/*
 * Initialize the configuration if not already done so.
 * @param {Hash} config
 */
x.initConfig = function(config) {
	log.debug("springxd.connector.initConfig: ", config);
	return new Promise( (resolve, reject) => {
		if (!global.config) {
			global.config = config;
		}
		resolve(config);
	});
}

x.waitForStreamStatus = function (streamName, retries) {
	log.debug("springxd.connector.waitForStreamStatus: %s", streamName);
	if (typeof retries == undefined) {
		retries = 5;
	}
	if (retries < 0) {
		var msg = util.format("Failed to wait for stream '%s' status (timeout).", streamName);
		log.warn(msg);
		return Promise.reject(msg);
	}
	return x.findStream(streamName)
		.then( stream => {
			if (stream && stream.status == STATUS_DEPLOYING) {
				return Promise.delay(2000).then(x.waitForStreamStatus(streamName, retries - 1));
			} else {
				return stream;
			}
		});
};


x.createStream = function (streamName, streamDefinition) {
	log.debug("springxd.connector.createStream: %s", streamName);

	var url = getStreamsURL();
	log.debug("String XD endpoint: ", url);
	log.info('Creating XD stream "' + streamName + '" with definition: ' + streamDefinition);

	var params = {form: {name: streamName, definition: streamDefinition }};

	return request.postAsync(url, params)
		.then( () => {
			return x.waitForStreamStatus(streamName);
		})
		.then( (stream) => {
			if (stream.status == STATUS_DEPLOYED) {
				log.info("Stream deployed successfully:", streamName);
				return stream;
			} else if (stream.status == STATUS_FAILED) {
				log.error("Unable to create stream '%s' (deploy failed). re-deploying!", streamName);
				return x.redeployStream(streamName);
			}
		})
		.catch( err => {
			log.debug("Error deploying stream: ", err);

			// TODO we may also end up here with a failure where redeploy could help
			// E.g.: Error: read ECONNRESET
			//at exports._errnoException (util.js:746:11)
			//at TCP.onread (net.js:559:26)

			return x.findStream(streamName)
				 .then(function(stream) {
					 log.info("springxd.connector.createStream: %s exists. Updating!", streamName);
					 // log.info(stream);
					 // TODO check if existing stream definition is identical to requested one
					 // TODO FR we should update the stream
				 })
				 .catch(function (err) {
					 var errMsg = util.format("Unable to create or find stream '%s': %s"+ streamName, err);
				 });

		})
	};

x.undeployStream = function(streamName) {
	log.info("Undeploying XD stream '%s'", streamName);

	var url = getStreamDeploymentsURL() + "/" + streamName;
	log.debug("Undeploy request url: ", url);

	return request.delAsync(url)
		.then( () => {
			return x.waitForStreamStatus(streamName)
		})
		.then(stream => {
			if(stream.status == STATUS_UNDEPLOYED) {
				return stream;
			} else {
				return Promise.reject(stream);
			}
		});
};

x.deployStream = function (streamName) {
	log.info("Deploying XD stream '%s'", streamName);
	var url = getStreamDeploymentsURL() + "/" + streamName;

	return request.postAsync(url)
		.then( () => {
			return x.waitForStreamStatus(streamName)
		})
		.then(stream => {
			if (stream.status == STATUS_DEPLOYED) {
				return stream;
			} else {
				return Promise.reject(stream);
			}
		});
};

x.redeployStream = function (streamName, retries) {
	log.info("springxd.connector.redeployStream: ", streamName);
	if (typeof retries == "undefined") {
		retries = 5;
	}
	if (retries < 0) {
		var msg = "Failed to re-deploy stream '" + streamName + "'.";
		log.error(msg);
		return Promise.reject(msg);
	}
	return x.undeployStream(streamName)
		.then( stream => {
			return x.deployStream(streamName);
		})
		.catch( stream => {
			return x.redeployStream(streamName, retries - 1);
		});
};

x.findStream = function(xdStreamId) {
	return new Promise(function (resolve, reject) {
		log.info("springxd.connector.findStream: ", xdStreamId);
		var url = getStreamsURL() + "/" + xdStreamId;

		request.getAsync(url).spread( (response, body) => {
			log.debug("springxd.connector.findStream - body: ", body);
			var json = JSON.parse(body);
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
			log.warn("springxd.connector.findStream - error: ", e.message);
			reject(e);
		})
	});
};

x.deleteStream = function(streamName) {
	log.info("Deleting XD stream '%s'", streamName);

	var url = getStreamsURL() + "/" + streamName;
	log.debug("Delete request url: ", url);

	return request.delAsync(url).spread( (response, body) => {
		return body;
	});
};
