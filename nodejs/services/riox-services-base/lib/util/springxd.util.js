'use strict';

var request = require('request');
var fs = require('fs');
var log = require('winston');

var x = exports;

function getBaseURL() {
	if (x.endpointURL) return x.endpointURL;
	return config.springxd.url;
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
		if (errorCallback) errorCallback("Failed to wait for stream status (timeout).");
		return;
	}
	setTimeout(function () {
		x.findStream(streamName, function (stream) {
			if (stream && stream.status == "deploying") {
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
			if (error) {
				if (errorCallback) errorCallback();
				return;
			}
			x.waitForStreamStatus(streamName, function (stream) {
				if (stream.status == "deployed") {
					callback(stream);
				} else if (stream.status == "failed") {
					console.log("unable to create stream (deploy failed). re-deploying!");
					x.redeployStream(streamName, callback, errorCallback);
				}
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
		var waitSec = 3000;
		setTimeout(function () {
			callback(body);
		}, waitSec);
	});
};
x.deployStream = function (streamName, callback, errorCallback) {
	var url = getStreamDeploymentsURL() + "/" + streamName;
	request.post(url, function (error, response, body) {
		if (error) {
			if (errorCallback) errorCallback();
			return;
		}
		x.waitForStreamStatus(streamName, callback, errorCallback);
	});
};

x.redeployStream = function (streamName, callback, errorCallback) {
	x.undeployStream(streamName, function () {
		x.deployStream(streamName, callback, errorCallback);
	}, errorCallback);
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

x.findStream = function (xdStreamId, callback, errorCallback) {
	var url = getStreamsURL() + '/' + xdStreamId;
	console.log("Using URL: ", url);
	request.get(url, function (error, response) {
		if (error) {
			if (errorCallback) {
				errorCallback(error);
				return;
			}
		}

		// no such stream definition
		if (response.statusCode == 404) {
			callback(null);
			return;
		}

		var stream = response.toJSON().body;
		if (typeof body == "string") {
			stream = JSON.parse(body);
		} else {
			errorCallback("Unexpected response: ", response);
		}

		callback(stream);
	});
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
	console.log("upload file " + file + " to URL " + url);
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
			console.log(response);
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
