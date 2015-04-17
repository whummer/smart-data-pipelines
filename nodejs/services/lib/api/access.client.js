var Client = require('node-rest-client').Client;
var appConfig = require('../../../web-ui/lib/app/config');

var pathPrefix = appConfig.services.access.url;
var client = new Client();
var api = {};

function getArgs(body) {
	return {
		data: body,
		headers: {"Content-Type": "application/json"} 
	};
}

function addMethod(name, path, method) {
	api[name] = function(params, callback) {
		var args = getArgs(params);
		client.methods[name](args, callback);
	}
	client.registerMethod(name, path, "GET");
}

addMethod("list", pathPrefix + "/", "GET");

module.exports = api;
