var appConfig = require('../../../web-ui/lib/app/config');
var apiUtil = require('./common');
var pathPrefix = appConfig.services.access.url;
var api = {};

/* add API methods */
apiUtil.addMethod(api, "list", pathPrefix + "/", "GET");

module.exports = api;
