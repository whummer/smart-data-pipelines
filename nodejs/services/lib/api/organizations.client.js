var appConfig = require('../../../web-ui/lib/app/config');
var apiUtil = require('./common');

var pathExpr = "global.servicesConfig.services.organizations.url";
var api = {};

/* add API methods */
api.list = apiUtil.registerMethod("organizations_list", 
		{pathExpr: pathExpr}, "GET");
api.get = apiUtil.registerMethod("organizations_get", 
		{pathExpr: pathExpr, replace: ["$", "/${id}"]},
		"GET", function(payload, config) {
			config.path.id = payload;
			return undefined;
		}
);
api.create = apiUtil.registerMethod("organizations_create", 
		{pathExpr: pathExpr}, "POST",
		function(payload, config) {
			config.path.id = payload;
			return undefined;
		}
);

module.exports = api;
