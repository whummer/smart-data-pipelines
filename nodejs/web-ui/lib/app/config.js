/**
 * global app configurations
 */
var appConfig = {
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

		users: { url: "http://localhost:8084/api/v1/users" },
		streams: { url: "http://localhost:8085/api/v1/streams" },

		streamsinks: { url: "http://localhost:8080/api/v1/stream-sinks" },
		simulations: { url: "http://localhost:8080/api/v1/simulations" },
		simulationProps: { url: "http://localhost:8080/api/v1/simulations/properties" },
		simulationDevices: { url: "http://localhost:8080/api/v1/simulations/devices" },
		simulationTypes: { url: "http://localhost:8080/api/v1/simulations/types" },
		ratings: { url: "http://localhost:8080/api/v1/ratings" },
		stats: { url: "http://localhost:8080/api/v1/stats" },
		files: { url: "http://localhost:8080/api/v1/files" },
		organizations: { url: "http://localhost:8080/api/v1/organizations" },
		billing: { url: "http://localhost:8080/api/v1/billing" },
		access: { url: "http://localhost:8080/api/v1/access" },
		semanticTypes: { url: "http://localhost:8080/api/v1/semantic-types" },
		websocket: { url: "ws://platform.riots.io:8085/websocket" }
	},
	auth: {
		github: {
			client_id: "49dfffa20fdaf8c5529d",
			redirect_uri: "http://platform.riots.io:8080/auth/github/callback"
		},
		google: {
			client_id: "1050661890767-kbb3fu29ss0d6rpj37doi4tca1opvc38.apps.googleusercontent.com",
			redirect_uri: "http://platform.riots.io:8080/auth/google/callback"
		},
		facebook: {
			client_id: "543561462440557",
			redirect_uri: "http://platform.riots.io:8080/auth/facebook/callback"
		},
	}
};

if(typeof module != "undefined") {
	module.exports = appConfig;
}