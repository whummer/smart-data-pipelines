/**
 * global app configurations
 */

var _host = "localhost";
if(typeof window != "undefined") {
	_host = window.location.hostname;
}

var appConfig = servicesConfig = {
	appRootPath: "/app",
	bowerRootPath: "/bower_components",
	services: {
		streams: { url: "http://" + _host + ":8085/api/v1/streams" },
//		streams: { url: "http://" + _host + "/api/v1/streams" },

		core: { url: "http://" + _host + ":8080/api/v1" },
		billing: { url: "http://" + _host + ":8080/api/v1/billing" },
		users: { url: "http://" + _host + ":8084/api/v1/users" },
		organizations: { url: "http://" + _host + ":8084/api/v1/organizations" },
		streamsources: { url: "http://" + _host + ":8085/api/v1/streams/sources" },
		streamsinks: { url: "http://" + _host + ":8085/api/v1/streams/sinks" },
		streamprocessors: { url: "http://" + _host + ":8085/api/v1/streams/processors" },
	    statistics: { url: "http://" + _host + ":8085/api/v1/statistics" },
	    ratings: { url: "http://" + _host + ":8085/api/v1/ratings" },
		access: { url: "http://" + _host + ":8085/api/v1/access" },
		files: { url: "http://" + _host + ":8087/api/v1/files" },
		notifications: { url: "http://" + _host + ":8084/api/v1/notifications" },
	    analytics: { url: "http://" + _host + ":8086/api/v1/analytics" },
	    consents: { url: "http://" + _host + ":8085/api/v1/consents" },
		certificates: { url: "http://" + _host + ":8084/api/v1/certificates" },

	    statisticsWebsocket: { url: "ws://" + _host + ":8085/api/v1/statistics/live" },
		websocket: { url: "ws://platform.riox.io:9001/" }
	},

	// List of user roles
	userRoles:
	[
		'guest', 	// non-registered user
		'apiKey',	// (anonymous) user identified via API Key
		'user',		// registered user
		'admin'		// admin
	]
};

if(typeof module != "undefined") {
	module.exports = appConfig;
}
