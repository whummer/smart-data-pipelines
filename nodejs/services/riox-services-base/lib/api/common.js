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

var updateClient = function(name, path, method) {
	var pathOrig = path;
	var pathBuilt = null;
	if(path.pathExpr) {
		pathBuilt = eval(path.pathExpr);
		if(path.replace) {
			pathBuilt = pathBuilt.replace(path.replace[0], path.replace[1]);
		}
	}
	if(client.methods[name]) {
		/* client already exists. check for updated path */
		if(!path.pathExpr) return;
		if(pathBuilt == client.methods[name].__path) {
			return;
		}
	}
	if(!path.pathExpr) {
		client.registerMethod(name, path, method);
	} else {
		path = pathBuilt;
		client.registerMethod(name, path, method);
		client.methods[name].__pathExpr = pathOrig;
	}
	client.methods[name].__path = path;
}

x.registerMethod = function(name, path, method, preprocessor) {
	
	return function(payload, config, callback) {

		/* make sure we always have an up-to-date client,
		 * in case the service URL changes in the config. */
		updateClient(name, path, method);

		if(typeof callback == "undefined") {
			callback = config;
			config = payload;
			payload = null;
		}
		if(preprocessor) {
			payload = preprocessor(payload, config);
		}
		var args = x.getArgs(payload, config);
		return client.methods[name](args, callback).
			on('error', function(err){
			    console.log('request error', err);
			}
		);
	}
}

module.exports = x;
