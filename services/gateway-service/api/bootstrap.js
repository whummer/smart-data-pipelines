"use strict";

(function() {

var Proxy = require('./proxies/proxy.model.js');
var riox = require('riox-shared/lib/api/riox-api');
var riox = require('riox-shared/lib/api/riox-api-admin')(riox);
var url = require('url');
var log = require('winston');


var getHost = function(service) {
	var serviceUrl = null;
	if(global.config[service]) {
		serviceUrl = global.config[service].url;
	} else {
		serviceUrl = global.config.services[service].url;
	}
	return url.parse(serviceUrl).host;
};

var rioxAPIs =
	[{
		name: "riox:web-ui",
		description: "Manage the Web UI",
		"organization-id-index" : 0,
		connector: {
			type: "http"
		},
		backends: [ "http://" + getHost("riox-ui")],
		"allow-cors": true,
		"public-access": true,
		operations:
		[{
			"name": "GET root",
			"http-method": "GET",
			"url-path": ""
		},{
			"name": "GET index HTML page",
			"http-method": "GET",
			"url-path": "^/index.html"
		},{
			"name": "GET /bower_components",
			"http-method": "GET",
			"url-path": "^/bower_components(.*)",
			"disable-log": true
		},{
			"name": "GET /app",
			"http-method": "GET",
			"url-path": "^/app(.*)",
			"disable-log": true
		},{
			"name": "GET robots.txt",
			"http-method": "GET",
			"url-path": "^/robots.txt",
			"disable-log": true
		},{
			"name": "GET favicon.ico",
			"http-method": "GET",
			"url-path": "^/favicon.ico",
			"disable-log": true
		},{
			"name": "GET Web metadata",
			"http-method": "GET",
			"url-path": "^/loaderio-(.*)",
			"disable-log": true
		},{
			"name": "POST demo data",
			"http-method": "POST",
			"url-path": "^/demo.*",
			"disable-log": true
		}]
	}];

var mapping = {
		"access": {},
		"organizations": {},
		"pipes": {},
		"pipeelements": {},
		"gateway": {},
		"proxies": {},
		"pricing": {},
		"billing": {},
		"users": {
			"public-access": true
		},
		"statistics": {},
		"ratings": {},
		"files": {},
		"notifications": {},
		"analytics": {},
		"consents": {},
		"certificates": {}
};

for(var key in mapping) {
	var port = mapping[key][PORT] ? mapping[key][PORT] : mapping[key];
	var pubAccess = mapping[key][PUBLIC_ACCESS];

	var entry = {
		name: "riox:" + key,
		description: "Manage " + key + " in the riox API",
		"organization-id-index" : 0,
		connector: {
			type: "http"
		},
		backends: [ "http://" + getHost(key) ],
		"allow-cors": true,
		"public-access": pubAccess,
		operations:
		[{
			"name": "GET " + key,
			"http-method": "GET",
			"url-path": "^/api/v1/" + key + "(.*)"
		}
		// TODO: currently we don't distinguish between HTTP methods
//		,{
//			"name": "POST " + key,
//			"http-method": "POST",
//			"url-path": "^/api/v1/" + key + "(.*)"
//		},{
//			"name": "PUT " + key,
//			"http-method": "PUT",
//			"url-path": "^/api/v1/" + key + "(.*)"
//		},{
//			"name": "DELETE " + key,
//			"http-method": "DELETE",
//			"url-path": "^/api/v1/" + key + "(.*)"
//		}
		]
	};
	rioxAPIs.push(entry);
};

var token = null;
var orgs = [];
var allProxies = [];

function findProxy(list, item) {
	var result = null;
	allProxies.forEach(function(proxy) {
		if(proxy[NAME] == item[NAME]) {
			if(result) console.log("WARN: Multiple proxies for name '" + proxy[NAME] + "':", result, proxy);
			result = proxy;
		}
	});
	return result;
};

function findOrInsertProxy(el, callback, errorCallback) {
	var existing = findProxy(allProxies, el);
	if(existing) {
		return callback();
	}
	var newObj = new Proxy(el);
	newObj.save(function(err, savedObj) {
		if(err || !savedObj) return errorCallback(err);
		callback(savedObj);
	});
}


function insertProxies(callback, errorCallback) {
	var promise = new Promise(function(resolve){resolve()});
	rioxAPIs.forEach(function(el) {
		promise = promise.then(function() {
			return new Promise(function(resolve, reject) {
				var index = el["organization-id-index"];
				var org = orgs[index];
				el[ORGANIZATION_ID] = orgs[index]._id;
				findOrInsertProxy(el, resolve, reject);
			});
		});
	});
	promise.then(callback, errorCallback);
}

function findOrgs(callback, errorCallback) {
	orgs = [];
	riox.signin(global.adminUser, function(tok) {
		token = {authorization: "Bearer " + tok.token};
		riox.organizations.all({
			headers: token,
			callback: function(list) {
				list.forEach(function(o) {
					var index = o.domain.indexOf("platform") >= 0 ? 0 :
							o.domain.indexOf("vienna") >= 0 ? 1 :
							o.domain.indexOf("bmw") >= 0 ? 2 :
							o.domain.indexOf("mercedes") >= 0 ? 3 :
							o.domain.indexOf("tesla") >= 0 ? 4 : 5;
					orgs[index] = o;
				});
				callback(orgs);
			}
		});
	}, function(e) {
		errorCallback(e);
		//console.log("ERROR: inserting demo data", e);
	});
}

function applyRules(callback, errorCallback) {
	var numRetries = 5;
	var retryTimeout = 5000;
	var tryCatchLoop = function() {
		riox.gateway.apply({}, callback, function(err) {
			if(--numRetries < 0) {
				return errorCallback();
			}
			log.warn("Unable to apply gateway rules, retrying:", err);
			setTimeout(tryCatchLoop, retryTimeout);
		});
	}
	tryCatchLoop();
}

function doInsert(callback, errorCallback) {
	Proxy.find({}, function(err, list) {
		allProxies = list;
		findOrgs(function() {
			insertProxies(function() {
				log.debug("Calling gateway to apply rules.");
				applyRules(callback, errorCallback);
			}, errorCallback);
		}, errorCallback);
	});
}

module.exports = doInsert;

module.exports.loopInsert = function() {
	log.info("Bootstrapping APIs metadata.");
	var timeout = 5*1000;
	var repeatTimeout = 30*1000;
	var loop = function() {
		doInsert(function(success) {
			/* success */
			log.info("Done bootstrapping APIs metadata.");
			/* unless someone set the global flag, loop and insert again after some time */
			if(!global.avoidLoopingForever) {
				setTimeout(loop, repeatTimeout);
			}
		}, function(err) {
			console.log("Cannot boostrap APIs metadata. (" + JSON.stringify(err) + "). Retry-ing in", timeout + "ms");
			/* error -> retry */
			setTimeout(loop, timeout);
		});
	}
	loop();
};


})()