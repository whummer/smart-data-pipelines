var appConfig = require('../../../web-ui/lib/app/config');
var apiUtil = require('./common');
var pathPrefix = appConfig.services.users.url;
var api = {};

/* add API methods */
api.auth = apiUtil.registerMethod("authLocal", pathPrefix + "/auth/local", "POST");

module.exports = api;

