 'use strict';

var auth = require('riox-services-base/lib/auth/auth.service');
var riox = require('riox-shared/lib/api/riox-api');
var proxy = require('simple-http-proxy');

/* PROXY METHODS */

exports.proxyElasticsearch = function(req, res, next) {

	var user = auth.getCurrentUser(req);
	var orgId = user.getDefaultOrganization()[ID];
	var search = "/elasticsearch";
	var index = req.url.indexOf(search) + search.length;
	var path = req.url.substring(index, req.url.length);
	path = path.replace(/\/ORG_ID\//, "/" + orgId + "/");
	var url = config.elasticsearch.url + path;
	log.info("Proxying to ES:", req.method, url);

	var request = require('request');
	req.pipe(request(url)).pipe(res);
};
