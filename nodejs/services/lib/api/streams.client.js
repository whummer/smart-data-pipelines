var Client = require('node-rest-client').Client;

var pathPrefix = appConfig.services.streams.url;
var client = new Client();
var api = {};

function getArgs(body) {
	return {
		data: body,
		headers: {"Content-Type": "application/json"} 
	};
}

function addMethod(name, path, method) {
	api[name] = function(params) {
		var args = getArgs(params);
		client.methods[name](args);
	}
	client.registerMethod(name, path, "GET");
}

addMethod("list", pathPrefix + "/", "GET");

module.exports = api;
