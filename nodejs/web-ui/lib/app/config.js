/**
 * global app configurations
 */
var appConfig = servicesConfig = {
	appRootPath: "/app",
	bowerRootPath: "/bower_components",
	services: {
		core: { url: "http://localhost:8080/api/v1" },
		apps: { url: "http://localhost:8080/api/v1/apps" },
		thingTypes: { url: "http://localhost:8080/api/v1/catalog/thing-types" },
		manufacturers: { url: "http://localhost:8080/api/v1/catalog/manufacturers" },
		drivers: { url: "http://localhost:8080/api/v1/drivers" },
		things: { url: "http://localhost:8080/api/v1/things" },
		thingData: { url: "http://localhost:8080/api/v1/things" },
		triggers: { url: "http://localhost:8080/api/v1/triggers" },
		simulations: { url: "http://localhost:8080/api/v1/simulations" },
		simulationProps: { url: "http://localhost:8080/api/v1/simulations/properties" },
		simulationDevices: { url: "http://localhost:8080/api/v1/simulations/devices" },
		simulationTypes: { url: "http://localhost:8080/api/v1/simulations/types" },
		ratings: { url: "http://localhost:8080/api/v1/ratings" },
		stats: { url: "http://localhost:8080/api/v1/stats" },
		billing: { url: "http://localhost:8080/api/v1/billing" },
		semanticTypes: { url: "http://localhost:8080/api/v1/semantic-types" },

    users: { url: "http://localhost:8084/api/v1/users" },
    organizations: { url: "http://localhost:8084/api/v1/organizations" },
    streams: { url: "http://localhost:8085/api/v1/streams" },
    streamsources: { url: "http://localhost:8085/api/v1/streams/sources" },
    streamsinks: { url: "http://localhost:8085/api/v1/streams/sinks" },
    streamprocessors: { url: "http://localhost:8085/api/v1/streams/processors" },
    access: { url: "http://localhost:8085/api/v1/access" },
    files: { url: "http://localhost:8087/api/v1/files" },
    analytics: { url: "http://localhost:8086/api/v1/analytics" },

		websocket: { url: "ws://platform.riox.io:8085/websocket" }
	},
	auth: {
		github: {
			client_id: "49dfffa20fdaf8c5529d",
			redirect_uri: "http://platform.riox.io:8080/auth/github/callback"
		},
		google: {
			client_id: "1050661890767-kbb3fu29ss0d6rpj37doi4tca1opvc38.apps.googleusercontent.com",
			redirect_uri: "http://platform.riox.io:8080/auth/google/callback"
		},
		facebook: {
			client_id: "543561462440557",
			redirect_uri: "http://platform.riox.io:8080/auth/facebook/callback"
		},
	}
};

if(typeof module != "undefined") {
	module.exports = appConfig;
}
