var appConfig = require('../../../web-ui/lib/app/config');
var apiUtil = require('./common');
var pathPrefix = appConfig.services.access.url;
var api = {};

/* add API methods */
api.list = apiUtil.registerMethod("access_list", pathPrefix + "/", "GET");

module.exports = api;
