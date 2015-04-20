/**
 * @author whummer
 */

(function() {

var Client = require('node-rest-client').Client;
var client = new Client();

var sh = {};

var __defaultHeaders = {
	'Content-Type': 'application/json'
}

var mergeObjects = function(src, tgt) {
	for (var attrname in src) {
		tgt[attrname] = src[attrname];
	}
}

var clone = function(obj) {
	return JSON.parse(JSON.stringify(obj));
}

var __getConfig = function(opts, body) {
	var options = {
		headers: clone(__defaultHeaders)
	};
	if(opts && opts.headers) {
		mergeObjects(opts.headers, options.headers)
	}
	if(body) {
		options.data = body;
	}
	return options;
}

sh.invokeGET = function(options, url, callback, errorCallback) {
	args = __getConfig(options);
	return client.get(url, args, function(data, response) {
		if(callback) {
			callback(data, response.status, response.headers, response);
		}
	}).
	on('error', function(err) {
		if(errorCallback) {
			var data = err.response ? err.response.data : undefined;
			var status = err.response ? err.response.status : undefined;
			var headers = err.response ? err.response.headers : undefined;
			errorCallback(data, status, headers, err.request.options);
		}
    });
}

sh.invokePOST = function(options, url, body, callback, errorCallback) {
	console.log("POST", url);
	args = __getConfig(options, body);
	return client.post(url, args, function(data, response) {
		if(callback) {
			callback(data, response.status, response.headers, response);
		}
	}).
	on('error', function(err) {
		if(errorCallback) {
			var data = err.response ? err.response.data : undefined;
			var status = err.response ? err.response.status : undefined;
			var headers = err.response ? err.response.headers : undefined;
			errorCallback(data, status, headers, err.request.options);
		}
    });
}

sh.invokePOSTandGET = function($http, url, body, callback) {
	invokePOST($http, url, body, 
		function(data, status, headers, config){
		var loc = headers("Location");
		invokeGET($http, loc, callback);
	})
}

sh.invokePUT = function($http, url, body, callback) {

	throw "not implemented";

	if(window.setLoadingStatus) setLoadingStatus(true);
	var cfg = __getConfig($http);
	$http = cfg.http;
	var options = cfg.options;
	$http.put(url, body, options).
	success(function(data, status, headers, config) {
		if(window.setLoadingStatus) setLoadingStatus(false);
		callback(data, status, headers, config);
	}).
	error(function(data, status, headers, config) {
		if(window.setLoadingStatus) setLoadingStatus(false);
		__alertServiceError(config, status);
	});
}

sh.invokeDELETE = function($http, url, callback) {

	throw "not implemented";

	if(window.setLoadingStatus) setLoadingStatus(true);
	var cfg = __getConfig($http);
	$http = cfg.http;
	var options = cfg.options;
	return $http.delete(url, options).
	success(function(data, status, headers, config) {
		if(window.setLoadingStatus) setLoadingStatus(false);
		callback(data, status, headers, config);
	}).
	error(function(data, status, headers, config) {
		if(window.setLoadingStatus) setLoadingStatus(false);
		__alertServiceError(config, status);
	});
}

/* expose API */
global.invokeGET = sh.invokeGET;
global.invokePOST = sh.invokePOST;
global.invokePOSTandGET = sh.invokePOSTandGET;
global.invokePUT = sh.invokePUT;
global.invokeDELETE = sh.invokeDELETE;
if(typeof module != "undefined") {
	module.exports = sh;
}

return sh;
})();