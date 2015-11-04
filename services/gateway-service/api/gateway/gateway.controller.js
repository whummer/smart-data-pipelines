 'use strict';

var auth = require('riox-services-base/lib/auth/auth.service');
var riox = require('riox-shared/lib/api/riox-api');
var driver = require('./driver.redx');
var logger = require('winston');
var LRUCache = require('lru-cache');
var proxy = require('simple-http-proxy');
var Promise = require('bluebird');

/* globals */
var organizationsCache = LRUCache({
	max: 200,
	maxAge: 1000 * 60 * 2
});


exports.apply = function(req, res) {
	logger.info("Starting to apply gateway rules");

	var prom = new Promise(function(resolve, reject){
		var query = {};
		riox.proxies.all(query, {
			headers: auth.getInternalCallTokenHeader(),
			callback: function(proxies) {
				applyConfig(proxies, resolve, reject);
			}
		}, function(err) {
			res.status(500).json({error: err});
		});
	});

	prom = prom.then(function() {
		var msg = "Successfully applied gateway rules.";
		logger.info(msg);
		res.json({message: msg});
	}, function(err) {
		res.status(500).json({message: "There was an error applying the gateway rules: ", error: ""+err});
	});
	return prom;
};


var applyConfig = function(sources, resolve, reject) {

	/* reset cache, to be on the safe side */
	organizationsCache.reset();

	var state = {};
	state.sources = sources;
	state.applied = {};
	state.applied.backends = [];
	state.applied.frontends = [];
	var prom = empty();

	prom.then(function() {
		return new Promise(function(resolve, reject) {
			driver.getAllEntries(state, function(entries) {
				state.before = entries;
				//console.log("state.before1", state.before);
				resolve();
			}, reject);
		});
	}).
	then(function() {
		return applySources(state);
	}).
	then(function() {
		//console.log("state.before2", state.before);
		state.before.containsFrontend = containsFrontend;
		state.before.containsBackend = containsBackend;
		driver.removeDiffEntries(state.before, state.applied, function() {
			resolve();
		}, reject);
	}).
	catch(function(e) {
		//logger.warn("Unable to apply gateway config: " + e);
		reject(e);
	});
};

var applySources = function(state) {

	var promises = [];

	var prom = new Promise(function(resolve) {
		/* init cache (load organization once) */
		var orgId = state.sources[0][ORGANIZATION_ID];
		riox.organization(orgId, {
			cache: organizationsCache,
			callback: function(org) {
				resolve();
			}
		});
	});
	return prom.then(function() {

		state.sources.forEach(function(source) {
			promises.push(applySource(source, state));
		});

		return Promise.all(promises)
	});
};

var isTopLevelDomain = function(host) {
	return host && host.match(/^.*\.((com)|(net)|(org)|(ftp\.sh)|(internal)|(cluster\.local))(:[0-9]+)?$/);
};
var isArray = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Array]';
};

var applySource = function(sourceObj, state) {
	if(!sourceObj[OPERATIONS]) sourceObj[OPERATIONS] = [];

	var promOuter = new Promise(function(resolve, reject) {

		/* set organization */
		riox.organization(sourceObj[ORGANIZATION_ID], {
			cache: organizationsCache,
			callback: function(org) {

				org[DOMAIN_NAME] = isArray(org[DOMAIN_NAME]) ? org[DOMAIN_NAME] : [ org[DOMAIN_NAME] ];
				var promises = [];

				org[DOMAIN_NAME].forEach(function(domain) {
					promises.push(applySourceForDomain(sourceObj, state, domain));
				});

				Promise.all(promises).
				then(function() {
					resolve();
				});
			}
		});
	});
	return promOuter;
};

var applySourceForDomain = function(sourceObj, state, domain) {
	return new Promise(function(resolve, reject) {
		var source = JSON.parse(JSON.stringify(sourceObj)); // clone object

		source.vhost = domain;
		if(!isTopLevelDomain(source.vhost)) {
			source.vhost += ".riox.io";
		}
		if(source[DOMAIN_NAME]) {
			source.vhost = source[DOMAIN_NAME] + "." + source.vhost;
		}

		var prom = empty();

		/* add endpoints */
		prom = prom.then(function() {
			return addEndpoints(source, state);
		});

		function doAdd(op) {
			return function() {
				return driver.addOperation(source, op, state).
				then(function(newEntry) {
					if(!containsFrontend(state.applied.frontends, newEntry)) {
						state.applied.frontends.push(newEntry);
					}
				});
			}
		}

		/* add route for each operation */
		source[OPERATIONS].forEach(function(operation) {
			prom = prom.then(doAdd(operation));
		});

		prom.then(function() {
			resolve();
		});
	});
};

var addEndpoints = function(source, state) {
	var prom = empty(state);
	source[BACKEND_ENDPOINTS].forEach(function(endpoint) {
		prom = prom.then(function() {
			function doAdd(ept) {
				return driver.addEndpoint(source, ept, state).
					then(function(newEntry) {
						if(!containsBackend(state.applied.backends, newEntry)) {
							//console.log("new backend entry: ", newEntry);
							state.applied.backends.push(newEntry);
						}
					});
			}
			return doAdd(endpoint);
		});
	});
	return prom;
};



/* PROXY METHODS */

exports.proxyElasticsearch = function(req, res, next) {

	var user = auth.getCurrentUser(req);
	var orgId = user.getDefaultOrganization()[ID];
	var search = "/elasticsearch";
	var index = req.url.indexOf(search) + search.length;
	var path = req.url.substring(index, req.url.length);
	path = path.replace(/\/ORG_ID\//, "/" + orgId + "/");
	var url = config.elasticsearch.url + path;
	//console.log(url);

	var request = require('request');
	req.pipe(request(url)).pipe(res);

	return;

	proxy(config.elasticsearch.url, {
		timeout: 3000,
		onrequest: function(opts, req) {
			//log.info("Proxying to ES:", req.method, url);
			opts.path = path;
			console.log("body", JSON.stringify(req.body));
			//console.log(req.body);
			return path;
		}
	})(req, res, function(err) {
		res.status(500);
		res.json({error: err});
	});
};


/* HELPER METHODS */

var empty = function(params) {
	return Promise.resolve(params);
};

function arraysEqual(a, b) {
	if (a === b) return true;
	if (a == null || b == null) return false;
	if (a.length != b.length) return false;
	for (var i = 0; i < a.length; ++i) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}

var containsBackend = function(list, backend) {
	for(var i = 0; i < list.length; i ++) {
		var item = list[i];
		if(item.name == backend.name) {
			if(arraysEqual(item.servers, backend.servers)) {
				//console.log("backend matches: " + item + " - " + backend);
				return true;
			}
		}
	}
	return false;
}

var containsFrontend = function(list, frontend) {
	for(var i = 0; i < list.length; i ++) {
		var item = list[i];
		if(item.url == frontend.url && 
				item.backend_name == frontend.backend_name) {
			return true;
		}
	}
	return false;
}