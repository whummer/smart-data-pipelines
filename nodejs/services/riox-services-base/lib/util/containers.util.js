'use strict';

var Docker = require('dockerode');
var promise = require('promise');
var docker = new Docker();
var x = exports;

x.listContainers = function(callback, errorCallback) {
	docker.listContainers(function (err, containers) {
		if(err) {
			console.log("Docker error: ", err);
			return errorCallback("Error listing docker containers:", err);
		}
		callback(containers);
	});
};

x.findContainers = function(name, callback, errorCallback) {
	x.listContainers(function(containers) {
		var result = [];
		var found = null;
		containers.forEach(function (c) {
			if(c.Image.match(name)) {
				result.push(c);
			}
		});
		callback(result);
	}, errorCallback);
};

x.findContainersArray = function(names, callback, errorCallback) {
	x.listContainers(function(containers) {
		var result = [];
		var found = null;
		containers.forEach(function (c) {
			names.forEach(function (name, idx) {
				if(c.Image.match(name)) {
					result[idx] = c;
				}
			});
		});
		callback(result);
	}, errorCallback);
};

x.findContainer = function(name, callback, errorCallback) {
	x.findContainers(name, function(result) {
		if(result.length > 1) {
			console.log("WARN: multiple containers found for name '" + name + "'");
		} else {
			callback(result[0]);
		}
	}, errorCallback);
};

x.getContainersIPs = function(names, callback, errorCallback) {
	x.findContainersArray(names, function(containers) {
		var result = [];
		var prom = new Promise(function(resolve){resolve()});
		containers.forEach(function(container, idx) {
			prom = prom.then(function(resolve, reject) {
				var func = function(resolve, reject) {
					x.getIPForContainerID(container.Id, function(ip) {
						result[idx] = ip;
						resolve();
					}, errorCallback);
				};
				return new Promise(func);
			});
		})
		prom.then(function() {
			callback(result);
		}, errorCallback);
	}, errorCallback);
}

x.getContainerIP = function(name, callback, errorCallback) {
	x.findContainer(name, function(container) {
		if(!container) return callback(null);
		x.getIPForContainerID(container.Id, callback, errorCallback);
	}, errorCallback);
};

x.getIPForContainerID = function(id, callback, errorCallback) {
	if(!id) return callback(null);
	var proxy = docker.getContainer(id);
	proxy.inspect(function (err, data) {
		if(err) return errorCallback(err);
		var result = data.NetworkSettings.IPAddress;
		callback(result);
	});
};

x.getHostPort = function(containerId, port, callback, errorCallback) {
	proxy.inspect(function (err, data) {
		if(err) {
			return errorCallback(err);
		}
		var bindings = data.NetworkSettings.Ports;
		var binding = bindings[port] ? bindings[port] : bindings[port + "/tcp"];
		var hostPort = binding[0].HostPort;
		callback(hostPort);
	});
};


