var appConfig = require('../../../web-ui/lib/app/config');
var apiUtil = require('./common');
var pathPrefix = appConfig.services.organizations.url;
var api = {};

/* add API methods */
api.list = apiUtil.registerMethod("organizations_list", pathPrefix + "/", "GET");
api.get = apiUtil.registerMethod("organizations_get", pathPrefix + "/${id}", "GET", 
		function(payload, config) {
			config.path.id = payload;
		}
);

module.exports = api;
