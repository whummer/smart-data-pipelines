'use strict';

var url = require("url");
var Client = require('node-rest-client').Client;

var client = new Client();

exports.removeAllEntries = function(params, resolve, reject) {
	getClient(params, function(client) {
		var url = getUrl("/flush");
		client.delete(url, function(data, response) {
			if(data.message != "OK") {
				return reject("Unable to remove entries. Response: " + JSON.stringify(data));
			}
			console.log("Gateway (redx): done flushing");
			resolve(params);
		});
	});
};

exports.addOperation = function(source, op, params) {
	return new Promise(function(resolve, reject) {
		getClient(params, function(client) {
			try {
				var method = op[HTTP_METHOD];
				if(method) {
					
					var path = op[URL_PATH];
					path = path.replace(/^\^/, '');
					path = path.replace(/\(\.\*\)$/, '');
					path = path.replace(/\(\(\$\)\|\(/, '');
					path = path.replace(/\)\)$/, '');
					path = path.replace(/\.\*/, '');
					var mappedPath = op[MAPPED_PATH] ? op[MAPPED_PATH] : op[URL_PATH];
					var vhost = source.vhost;

					//var key = PREFIX + 'frontend:' + vhost + ':' + method.toLowerCase();
					//var routeMap = {};
					//routeMap[path] = source[ID] + ":" + mappedPath;

					var url = "/batch";
					var args = {
						data: { frontends: 
							[{
								"url": vhost + "" + path,
					            "backend_name": source[ID]
							}]
						}
					};
					//console.log(JSON.stringify(args));
					client.post(getUrl(url), args, function(data,response) {
						//console.log(data);
						if(data.message != "OK") {
							return reject("Unable to add operation. Response: " + JSON.stringify(data));
						}
						resolve(params);
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
	return new Promise(function(resolve, reject) {
		getClient(params, function(client) {
			var vhost = source.vhost;
			//var key = PREFIX + 'frontend:' + vhost + ':' + source[ID];

			endpoint = endpoint.replace(/^[a-z]+:\/\//, '');

			var url = "/batch";
			var args = {
				data: { backends: 
					[{
						"name": source[ID],
			            "servers": 
			            	[
			            	 endpoint
			            	]
					}]
				}
			};
			//console.log(JSON.stringify(args));
			var url = getUrl(url);
			//console.log(url);
			client.post(url, args, function(data,response) {
				//console.log(data);
				if(data.message != "OK") {
					return reject("Unable to add endpoint. Response: " + JSON.stringify(data));
				}
				resolve(params);
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

var getUrl = function(u) {
	u = config.nginx.url + u;
	return u;
};
var getClient = function(params, callback) {
	if(callback) callback(client);
	return client;
};
