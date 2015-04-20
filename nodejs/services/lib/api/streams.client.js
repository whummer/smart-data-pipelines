var appConfig = require('../../../web-ui/lib/app/config');
var apiUtil = require('./common');
var pathPrefix = appConfig.services.streams.url;
var api = {};

/* add API methods */
api.list = apiUtil.registerMethod("streams_list", pathPrefix + "/", "GET");

module.exports = api;

