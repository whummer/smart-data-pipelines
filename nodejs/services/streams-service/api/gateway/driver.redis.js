'use strict';

var redis = require("redis");
var url = require("url");

var config = {
		url: "redis://redis.dev.riox.internal:6379"
};
var PREFIX = "";

exports.removeAllEntries = function(params, resolve, reject) {
//	console.log("removeAllEntries");
	getClient(params, function(client) {
		client.flushdb(function(err, data) {
			if(err) {
				return reject(err);
			}
			resolve(params);
		});
	});
};

exports.addOperation = function(source, op, params) {
//	console.log("addOperation: ", op[NAME]);
	return new Promise(function(resolve, reject) {
		getClient(params, function(client) {
			try {
				var method = op[HTTP_METHOD];
				if(method) {
					var path = op[URL_PATH];
					var mappedPath = op[MAPPED_PATH] ? op[MAPPED_PATH] : op[URL_PATH];
					var vhost = source.vhost;
					var key = PREFIX + 'frontend:' + vhost + ':' + method.toLowerCase();
					var routeMap = {};
					routeMap[path] = source[ID] + ":" + mappedPath;
					client.hmset(key, routeMap, function (err, data) {
//						console.log("addOperation ->", err, data);
						if (err) return reject(err);
						else resolve(params);
					});
				} else {
					resolve(params);
				}
			} catch (e) {
				console.log(e);
				reject(e);
			}
		});
	});
};

exports.addEndpoint = function(source, endpoint, params) {
//	console.log("addEndpoint", endpoint);
	return new Promise(function(resolve, reject) {
		getClient(params, function(client) {
			var vhost = source.vhost;
			var key = PREFIX + 'frontend:' + vhost + ':' + source[ID];
//			console.log(key);
			client.rpush(key, endpoint, function(err, data) {
//				console.log("addEndpoint ->", err, data);
				if (err) return reject(err);
				else resolve(params);
			});
		});
	});
};

exports.printAllKeys = function(params) {
	getClient(params, function(client) {
		client.keys("*", function(err, data) {
			console.log("all keys:", data);
		});
	});
};

/* HELPER METHODS */

var getClient = function(params, callback) {
	if(params.client) {
		return callback(params.client);
	}
	var u = url.parse(config.url);

	var client = redis.createClient(u.port, u.hostname);
	client.on('ready', function () {
		params.client = client;
		if(callback) callback(client);
	});
	return client;
};
