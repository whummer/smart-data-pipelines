/**
 * global app configurations
 */
var appConfig = servicesConfig = {
	appRootPath: "/app",
	bowerRootPath: "/bower_components",
	services: {
		core: { url: "http://localhost:8080/api/v1" },
		billing: { url: "http://localhost:8080/api/v1/billing" },
		users: { url: "http://localhost:8084/api/v1/users" },
		organizations: { url: "http://localhost:8084/api/v1/organizations" },
		streams: { url: "http://localhost:8085/api/v1/streams" },
		streamsources: { url: "http://localhost:8085/api/v1/streams/sources" },
		streamsinks: { url: "http://localhost:8085/api/v1/streams/sinks" },
		streamprocessors: { url: "http://localhost:8085/api/v1/streams/processors" },
		access: { url: "http://localhost:8085/api/v1/access" },
		files: { url: "http://localhost:8087/api/v1/files" },
		notifications: { url: "http://localhost:8084/api/v1/notifications" },
	    analytics: { url: "http://localhost:8086/api/v1/analytics" },
	    consents: { url: "http://localhost:8086/api/v1/consents" },

		websocket: { url: "ws://platform.riox.io:9001/" }
	}
};

if(typeof module != "undefined") {
	module.exports = appConfig;
}
