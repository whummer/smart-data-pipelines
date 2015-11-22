/**
 * global app configurations
 */
'use strict';

var _host = "platform.riox.io";
var wsProtocol = "ws:";
if (typeof window != "undefined") {
	var isSecure = window.location.protocol.indexOf("https") === 0;
	if (isSecure) {
		wsProtocol = "wss:";
	}
	_host = window.location.host;
}


var appConfig = window.appConfig = {
	appRootPath: "/app",
	bowerRootPath: "/bower_components",
	services: {
		pipes: {url: "//" + _host + "/api/v1/pipes"},
		organizations: {url: "//" + _host + "/api/v1/organizations"},
		billing: {url: "//" + _host + "/api/v1/billing"},
		pricing: {url: "//" + _host + "/api/v1/pricing"},
		users: {url: "//" + _host + "/api/v1/users"},
		pipeelements: {url: "//" + _host + "/api/v1/pipeelements"},
		gateway: {url: "//" + _host + "/api/v1/gateway"},
		proxies: {url: "//" + _host + "/api/v1/proxies"},
		statistics: {url: "//" + _host + "/api/v1/statistics"},
		ratings: {url: "//" + _host + "/api/v1/ratings"},
		access: {url: "//" + _host + "/api/v1/access"},
		files: {url: "//" + _host + "/api/v1/files"},
		notifications: {url: "//" + _host + "/api/v1/notifications"},
		analytics: {url: "//" + _host + "/api/v1/analytics"},
		consents: {url: "//" + _host + "/api/v1/consents"},
		certificates: {url: "//" + _host + "/api/v1/certificates"},
		statisticsWebsocket: {url: wsProtocol + "//" + _host + "/api/v1/statistics/live"}
	},

	// List of user roles
	userRoles: [
		'guest', 	// non-registered user
		//'apiKey',	// (anonymous) user identified via API Key
		'user',		// registered user
		'admin'		// admin
	]
};

/* set servicesConfig variable */
window.servicesConfig = appConfig.services;

if (typeof module != "undefined") {
	module.exports = appConfig;
}
