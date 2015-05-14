'use strict';

var request = require('request');
var fs = require('fs');
var log = global.log || require('winston');

var x = exports;
var STATUS_DEPLOYING = "deploying";
var STATUS_DEPLOYED = "deployed";
var STATUS_FAILED = "failed";

function getBaseURL() {
	return "http://" + config.xdadmin.hostname + ":" + config.xdadmin.port;
}
function getStreamsURL() {
	return getBaseURL() + "/streams/definitions";
}
function getStreamDeploymentsURL() {
	return getBaseURL() + "/streams/deployments";
}
function getModulesURL() {
	return getBaseURL() + "/modules";
}
function getRuntimeModulesURL() {
	return getBaseURL() + "/runtime/modules";
}
function getContainersURL() {
	return getBaseURL() + "/runtime/containers";
}

x.waitForStreamStatus = function (streamName, callback, errorCallback, retries) {
	if (typeof retries == "undefined") {
		retries = 5;
	}
	if (retries < 0) {
		var msg = "Failed to wait for stream status (timeout).";
		log.warn(msg);
		if (errorCallback) errorCallback(msg);
		return;
	}
	setTimeout(function () {
		x.findStream(streamName, function (stream) {
			if (stream && stream.status == STATUS_DEPLOYING) {
				x.waitForStreamStatus(streamName, callback, errorCallback, retries - 1);
			} else {
				callback(stream);
			}
		});
	}, 3000);
};

x.createStream = function (streamName, streamDefinition, callback, errorCallback) {
	var url = getStreamsURL();
	console.log('Creating XD stream "' + streamName + '" with definition: ' + streamDefinition);
	request.post(url, {form: {name: streamName, definition: streamDefinition}},
		function (error, response, body) {
			if (error || (response.statusCode >= 400 && response.statusCode < 600)) {
				var error = "Unable to create Spring XD stream (" + response.statusCode + ")" + error;
				/* maybe the stream already exists -> try to find */
				x.findStream(streamName, function(stream) {
					if(stream) {
						// TODO check if existing stream definition is identical to requested one
						return callback(stream);
					}
					if(errorCallback) errorCallback("Unable to create or find stream", streamName);
				}, errorCallback);
				return;
			}
			x.waitForStreamStatus(streamName, function (stream) {
				if (stream.status == STATUS_DEPLOYED) {
					callback(stream);
				} else if (stream.status == STATUS_FAILED) {
					console.log("unable to create stream '" + streamName + "' (deploy failed). re-deploying!");
					x.redeployStream(streamName, callback, errorCallback);
				}
			}, function() {
				x.redeployStream(streamName, callback, errorCallback);
			});
		}
	);
};

x.undeployStream = function (streamName, callback, errorCallback) {
	var url = getStreamDeploymentsURL() + "/" + streamName;
	request.del(url, function (error, response, body) {
		if (error) {
			if (errorCallback) errorCallback();
			return;
		}
		var waitMS = 3000;
		setTimeout(function () {
			x.waitForStreamStatus(streamName, callback, errorCallback);
		}, waitMS);
	});
};
x.deployStream = function (streamName, callback, errorCallback) {
	var url = getStreamDeploymentsURL() + "/" + streamName;
	request.post(url, function (error, response, body) {
		if (error) {
			if (errorCallback) errorCallback();
			return;
		}
		x.waitForStreamStatus(streamName, function(stream) {
			if(stream.status == STATUS_DEPLOYED) {
				callback(stream);
			} else {
				errorCallback(stream);
			}
		}, errorCallback);
	});
};

x.redeployStream = function (streamName, callback, errorCallback, retries) {
	if (typeof retries == "undefined") {
		retries = 5;
	}
	if (retries < 0) {
		var msg = "Failed to re-deploy stream '" + streamName + "'.";
		log.warn(msg);
		if (errorCallback) errorCallback(msg);
		return;
	}
	x.undeployStream(streamName, function () {
		x.deployStream(streamName, callback, function() {
			x.redeployStream(streamName, callback, errorCallback, retries - 1);
		});
	}, function() {
		x.redeployStream(streamName, callback, errorCallback, retries - 1);
	});
};

x.listStreams = function (streamName, callback, errorCallback) {
	var url = getStreamsURL();
	request.get(url + "?size=10000",
		function (error, response) {
			if (error) {
				if (errorCallback) errorCallback(error);
				return;
			}
			var body = response.toJSON().body;
			if (typeof body == "string") {
				body = JSON.parse(body);
			}
			var list = [];
			if (body._embedded && body._embedded.streamDefinitionResourceList) {
				list = body._embedded.streamDefinitionResourceList;
			}
			callback(list);
		}
	);
};

x.findStream = function(xdStreamId, callback, errorCallback) {
	x.listStreams(null, function(list) {
		var found = false;
		list.forEach(function(el) {
			if(xdStreamId == el.name) {
				found = true;
				callback(el);
				return el;
			}
		});
		if(!found) {
			callback(null);
		}
	}, errorCallback);
};

x.listModules = function (callback, errorCallback) {
	var url = getModulesURL();
	request.get(url + "?size=10000",
		function (error, response) {
			if (error) {
				if (errorCallback) errorCallback(error);
				return;
			}
			var body = response.toJSON().body;
			if (typeof body == "string") {
				body = JSON.parse(body);
			}
			var list = [];
			if (body._embedded && body._embedded.moduleDefinitionResourceList) {
				list = body._embedded.moduleDefinitionResourceList;
			}
			callback(list);
		}
	);
};

x.findModule = function (type, name, callback, errorCallback) {
	x.listModules(function (list) {
		list.forEach(function (mod) {
			if (mod.type == type && mod.name == name)
				return callback(mod);
		});
		callback(null);
	}, errorCallback);
};

x.findDeployedModules = function (names, callback, errorCallback) {
	x.listDeployedModules(function (mods) {
		var result = [];
		mods.forEach(function (mod) {
			names.forEach(function (name, idx) {
				if (mod.moduleId && mod.moduleId.match(name)) {
					result[idx] = mod;
				} else if (!result[idx]) {
					result[idx] = null;
				}
			});
		});
		callback(result);
	}, errorCallback);
};

x.listDeployedModules = function (callback, errorCallback) {
	var url = getRuntimeModulesURL();
	request.get(url + "?size=10000",
		function (error, response) {
			if (error) {
				if (errorCallback) errorCallback(error);
				return;
			}
			var body = response.toJSON().body;
			if (typeof body == "string") {
				body = JSON.parse(body);
			}
			var list = [];
			if (body._embedded && body._embedded.moduleMetadataResourceList) {
				list = body._embedded.moduleMetadataResourceList;
			}
			callback(list);
		}
	);
};

x.listContainers = function (callback, errorCallback) {
	var url = getContainersURL();
	request.get(url + "?size=10000",
		function (error, response) {
			if (error) {
				if (errorCallback) errorCallback(error);
				return;
			}
			var body = response.toJSON().body;
			if (typeof body == "string") {
				body = JSON.parse(body);
			}
			var list = [];
			if (body._embedded && body._embedded.detailedContainerResourceList) {
				list = body._embedded.detailedContainerResourceList;
			}
			callback(list);
		}
	);
};

x.findContainer = function (containerId, callback, errorCallback) {
	x.listContainers(function (list) {
		var result = null;
		list.forEach(function (cont) {
			if (cont.containerId && cont.containerId.match(containerId)) {
				result = cont;
			}
		});
		return callback(result);
	}, errorCallback);
};

x.findContainersOfDeployedModules = function (names, callback, errorCallback) {
	x.findDeployedModules(names, function (mods) {
		var result = [];
		var prom = new Promise(function (resolve) {
			resolve()
		});
		mods.forEach(function (mod, idx) {
			prom = prom.then(function (resolve, reject) {
				var func = function (resolve, reject) {
					x.findContainer(mod.containerId, function (cont) {
						result[idx] = cont;
						resolve(cont);
					});
				};
				return new Promise(func);
			});
		})
		prom.then(function () {
			callback(result);
		});
	}, errorCallback);
};

/* TODO: deprecated (modules are only uploaded to the admin container,
 * NOT the individual Spring XD "worker" containers). */

x.uploadModule = function (type, name, file, callback, errorCallback) {
	var url = getModulesURL() + "/" + type + "/" + name;
	var options = {
		headers: {
			"Content-Type": "application/octet-stream"
		},
		url: url,
		callback: function (error, response) {
			if (error) {
				if (errorCallback) errorCallback(error);
				return;
			}
			callback(response);
		},
	}
	var r = fs.createReadStream(file).pipe(
		request.post(options)
	);
	r.on('end', options.callback);
};

x.findPorts = function (callback, errorCallback) {
	x.listStreams(function (streams) {
		var ports = [];
		streams.forEach(function (str) {
			console.log("=--> ", str)
			// TODO
		});
		return ports;
	});
};
