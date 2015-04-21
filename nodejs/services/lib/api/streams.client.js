var apiUtil = require('./common');

var pathExpr = "global.servicesConfig.services.streams.url";
var api = {};

/* add API methods */
api.list = apiUtil.registerMethod("streams_list", {pathExpr: pathExpr}, "GET");
api.get = apiUtil.registerMethod("streams_get",
		{pathExpr: pathExpr, replace: ["$", "/${id}"]},
		"GET", function(payload, config) {
			config.path.id = payload;
			return undefined;
		}
);

module.exports = api;
