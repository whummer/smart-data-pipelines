'use strict';

var url = require("url");
var Client = require('node-rest-client').Client;
var log = require('winston');

var client = new Client();

exports.removeDiffEntries = function(stateBefore, appliedEntries, resolve, reject) {
	var diff = [];

	//console.log("stateBefore", JSON.stringify(stateBefore, null, '\t'));
	//console.log("appliedEntries", JSON.stringify(appliedEntries, null, '\t'));

	var entriesToDelete = {};
	entriesToDelete.frontends = [];
	entriesToDelete.backends = [];

	var containsFrontend = stateBefore.containsFrontend;
	var containsBackend = stateBefore.containsBackend;

	/* clean frontend entries */
	if(stateBefore.frontends.forEach) {
		stateBefore.frontends.forEach(function(frontend) {
			if(containsFrontend(appliedEntries.frontends, frontend)) {
				/* OK, keep this entry */
			} else {
				console.log("delete frontend", frontend);
				entriesToDelete.frontends.push(frontend);
			}
		});
	}

	/* clean backend entries */
	if(stateBefore.backends.forEach) {
		stateBefore.backends.forEach(function(backend) {
			if(containsBackend(appliedEntries.backends, backend)) {
				/* OK, keep this entry */
			} else {
				console.log("delete backend", backend);
				entriesToDelete.backends.push(backend);
			}
		});
	}

	deleteEntries(entriesToDelete).
	then(function() {
		resolve();
	});
};

exports.getAllEntries = function(params, resolve, reject) {
	var result = {};
	getClient(params, function(client) {
		/* get frontends */
		var url = getUrl("/frontends");
		var req = client.get(url, function(data, response) {
			if(data.message != "OK") {
				return reject("Unable to retrieve frontends. Response: " + JSON.stringify(data));
			}
			result.frontends = data.data;
			/* get backends */
			var url = getUrl("/backends");
			var req1 = client.get(url, function(data, response) {
				if(data.message != "OK") {
					return reject("Unable to retrieve backends. Response: " + JSON.stringify(data));
				}
				result.backends = data.data;
				resolve(result);
			});
			req1.on('error', function(err){
			    log.warn('Unable to contact gateway API (get backends).');
			    reject(err);
			});
		});
		req.on('error', function(err){
		    log.warn('Unable to contact gateway API (get frontends).');
		    reject(err);
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
	
					var url = "/batch";
					var newEntry = {
						"url": vhost + "" + path,
			            "backend_name": source[ID]
					};
					var args = {
						data: { frontends: [newEntry] }
					};
					//console.log(JSON.stringify(args));
					var req = client.post(getUrl(url), args, function(data,response) {
						//console.log("POSTed operation");
						if(data.message != "OK") {
							return reject("Unable to add operation. Response: " + JSON.stringify(data));
						}
						resolve(newEntry);
					});
					req.on('error', function(err){
					    log.warn('Unable to contact gateway API (add frontend).');
					    reject(err);
					});

				} else {
					console.log("WARN: HTTP method missing in operation:", op);
					resolve();
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

			endpoint = endpoint.replace(/^[a-z]+:\/\//, '');

			var url = "/batch";
			var newEntry = {
					"name": source[ID],
		            "servers": 
		            	[
		            	 endpoint
		            	]
				};
			var args = {
				data: { backends: [newEntry]
				}
			};
			var url = getUrl(url);
			var req = client.post(url, args, function(data,response) {
				if(data.message != "OK") {
					return reject("Unable to add endpoint. Response: " + JSON.stringify(data));
				}
				resolve(newEntry);
			});
			req.on('error', function(err){
			    log.warn('Unable to contact gateway API (add backend).');
			    reject(err);
			});
		});
	});
};

var deleteEntries = function(entries) {
	//console.log("delete entries", JSON.stringify(entries, null, '\t'));
	return new Promise(function(resolve, reject) {
		getClient(null, function(client) {
			var url = "/batch";
			var args = {
				data: entries
			};
			var url = getUrl(url);
			var req = client.delete(url, args, function(data,response) {
				if(data.message != "OK") {
					return reject("Unable to delete entries. Response: " + JSON.stringify(data));
				}
				resolve(entries);
			});
			req.on('error', function(err){
			    log.warn('Unable to contact gateway API (delete entries).');
			    reject(err);
			});
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