var apiUtil = require('./common');

var pathExpr = "global.servicesConfig.services.access.url";
var api = {};

/* add API methods */
api.list = apiUtil.registerMethod("access_list", {pathExpr: pathExpr}, "GET");
api.request = apiUtil.registerMethod("access_request", {pathExpr: pathExpr}, "POST");

module.exports = api;
