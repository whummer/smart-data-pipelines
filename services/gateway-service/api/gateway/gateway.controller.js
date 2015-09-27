 'use strict';

var auth = require('riox-services-base/lib/auth/auth.service');
var riox = require('riox-shared/lib/api/riox-api');
//var driver = require('./driver.redis');
var driver = require('./driver.redx');
var logger = require('winston');
var LRUCache = require("lru-cache");
var proxy = require('express-http-proxy');

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

	var params = {};
	params.sources = sources;

	/* reset cache, to be on the safe side */
	organizationsCache.reset();

	new Promise(function(resolve, reject) {
		driver.removeAllEntries(params, resolve, reject);
	}).
	then(applySources, reject).
	//then(driver.printAllKeys, reject).
	then(resolve, reject);
};

var applySources = function(params) {
	var prom = empty(params);

	params.sources.forEach(function(source) {
		prom = prom.then(function() {
			return new Promise(function(resolve, reject) {
				applySource(source, params, resolve, reject);
			});
		});
	});

	return prom;
};

var isTopLevelDomain = function(host) {
	return host && host.match(/^.*\.((com)|(net)|(org)|(ftp\.sh)|(internal)|(cluster\.local))(:[0-9]+)?$/);
};
var isArray = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Array]';
};

var applySource = function(sourceObj, params, resolve, reject) {
	if(!sourceObj[OPERATIONS]) sourceObj[OPERATIONS] = [];

	//console.log("sourceObj", sourceObj);

	var promOuter = new Promise(function(resolve, reject) {

		/* set organization */
		riox.organization(sourceObj[ORGANIZATION_ID], {
			cache: organizationsCache,
			callback: function(org) {

				org[DOMAIN_NAME] = isArray(org[DOMAIN_NAME]) ? org[DOMAIN_NAME] : [ org[DOMAIN_NAME] ];
				
				org[DOMAIN_NAME].forEach(function(domain) {
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
						return addEndpoints(source, params);
					}, reject);

					/* add routes */
					source[OPERATIONS].forEach(function(op) {
						prom = prom.then(function() {
							return driver.addOperation(source, op, params);
						}, reject);
					});

					prom.then(resolve, reject);
				});
			}
		});
	});

	promOuter = promOuter.then(resolve, reject);
	return promOuter;
};

var addEndpoints = function(source, params) {
	var prom = empty(params);
	source[BACKEND_ENDPOINTS].forEach(function(endpoint) {
		prom = prom.then(function() {
			return driver.addEndpoint(source, endpoint, params);
		});
	});
	return prom;
};

/* PROXY METHODS */

exports.proxyElasticsearch = function(req, res, next) {
	proxy(config.elasticsearch.url, {
	    forwardPath: function (req, res, next) {
	    	console.log(req.url);
	    	var user = auth.getCurrentUser(req);
	    	var orgId = user.getDefaultOrganization()[ID];
	    	var search = "/elasticsearch";
	    	var index = req.url.indexOf(search) + search.length;
	    	var url = req.url.substring(index, req.url.length);
	    	url = url.replace(/\/ORG_ID\//, "/" + orgId + "/");
	    	console.log(url);
	        return url;
	    }
	})(req, res, next);
};


/* HELPER METHODS */

var empty = function(params) {
	return new Promise(function(resolve){ resolve(params); });
};
