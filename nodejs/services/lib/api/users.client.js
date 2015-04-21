var apiUtil = require('./common');

var pathExpr = "global.servicesConfig.services.users.url";
var api = {};

/* add API methods */
api.auth = apiUtil.registerMethod("authLocal", 
		{pathExpr: pathExpr, replace: ["$", "/auth/local"]}, "POST");
api.signup = apiUtil.registerMethod("authLocal", 
		{pathExpr: pathExpr}, "POST");

module.exports = api;

