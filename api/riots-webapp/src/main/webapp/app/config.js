/**
 * global app configurations
 */
var appConfig = {
	appRootPath: "/app",
	bowerRootPath: "/bower_components",
	services: {
		core: { url: "/api/v1" },
		apps: { url: "/api/v1/apps" },
		thingTypes: { url: "/api/v1/catalog/thing-types" },
		manufacturers: { url: "/api/v1/catalog/manufacturers" },
		drivers: { url: "/api/v1/drivers" },
		things: { url: "/api/v1/things" },
		thingData: { url: "/api/v1/things" },
		triggers: { url: "/api/v1/triggers" },
		streams: { url: "/api/v1/streams" },
		streamsinks: { url: "/api/v1/stream-sinks" },
		simulations: { url: "/api/v1/simulations" },
		simulationProps: { url: "/api/v1/simulations/properties" },
		simulationDevices: { url: "/api/v1/simulations/devices" },
		simulationTypes: { url: "/api/v1/simulations/types" },
		ratings: { url: "/api/v1/ratings" },
		stats: { url: "/api/v1/stats" },
		users: { url: "/api/v1/users" },
		organizations: { url: "/api/v1/organizations" },
		billing: { url: "/api/v1/billing" },
		semanticTypes: { url: "/api/v1/semantic-types" },
		websocket: { url: "ws://platform.riots.io:8085/websocket" }
	},
	auth: {
		github: {
			client_id: "49dfffa20fdaf8c5529d"
		},
		google: {
			client_id: "1050661890767-kbb3fu29ss0d6rpj37doi4tca1opvc38.apps.googleusercontent.com"
		},
		facebook: {
			client_id: "543561462440557"
		},
		redirect_uri: "http://platform.riots.io:8080/app/views/login_result.html"
	}
};

// set websocket URL (TODO for dev./testing):
if(window.location && window.location.hostname) {
	appConfig.services.websocket.url = appConfig.services.websocket.url.replace(
		"platform.riots.io", window.location.hostname);
}
