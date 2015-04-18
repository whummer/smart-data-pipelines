var Client = require('node-rest-client').Client;
var client = new Client();

var x = {};

x.getArgs = function(body, config) {
	var result = {
		headers: {
			"Content-Type": "application/json"
		}
	};
	if(body) {
		result.data = body;
	}
	if(config && config.headers) {
		result.headers.authorization = config.headers.authorization;
	}
	return result;
}

x.addMethod = function(apiObj, name, path, method) {
	apiObj[name] = function(body, config, callback) {
		//console.log("invoke", name, body, path, config);
		var args = x.getArgs(body, config);
		return client.methods[name](args, callback).
			on('error', function(err){
			    console.log('request error', err);
			}
		);
	}
	client.registerMethod(name, path, "GET");
}

module.exports = x;
