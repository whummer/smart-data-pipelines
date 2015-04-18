var Client = require('node-rest-client').Client;
var x = {};
var client = x.client = new Client();

x.getArgs = function(body, config) {
	var result = {
		headers: {
			"Content-Type": "application/json"
		}
	};
	if(body) {
		result.data = body;
	}
	if(config) {
		if(config.headers)
			result.headers.authorization = config.headers.authorization;
		if(config.path)
			result.path = config.path;
	}
	return result;
}

x.addMethod = function(apiObj, name, path, method) {
	apiObj[name] = x.registerMethod(name, path, method);
}

x.registerMethod = function(name, path, method, preprocessor) {
	client.registerMethod(name, path, method);
	//console.log("registerMethod!", path);
	return function(payload, config, callback) {
		//console.log("invoke", name, body, path, config);
		//console.log("!!", path);
		//console.trace();
		if(typeof callback == "undefined") {
			callback = config;
			config = payload;
			payload = null;
		}
		if(preprocessor) {
			preprocessor(payload, config);
		}
		var args = x.getArgs(payload, config);
//		console.log("args", name, args);
		return client.methods[name](args, callback).
			on('error', function(err){
			    console.log('request error', err);
			}
		);
	}
}

module.exports = x;
