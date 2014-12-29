/**
 * global app configurations
 */
var appConfig = {
	appRootPath: "/app",
	services: {
		core: { url: "http://localhost:8080/api/v1" },
		thingTypes: { url: "http://localhost:8080/api/v1/catalog/thing-types" },
		manufacturers: { url: "http://localhost:8080/api/v1/catalog/manufacturers" },
		thingTypeProps: { url: "http://localhost:8080/api/v1/thing-types/properties" },
		drivers: { url: "http://localhost:8080/api/v1/drivers" },
		things: { url: "http://localhost:8080/api/v1/things" },
		categories: { url: "http://localhost:8080/api/v1/categories" },
		semanticTypes: { url: "http://localhost:8080/api/v1/semantic-types" },
		simulations: { url: "http://localhost:8080/api/v1/simulations" },
		ratings: { url: "http://localhost:8080/api/v1/ratings" },
		simulationProps: { url: "http://localhost:8080/api/v1/simulations/properties" },
		simulationDevices: { url: "http://localhost:8080/api/v1/simulations/devices" },
		stats: { url: "http://localhost:8080/api/v1/stats" },
		users: { url: "http://localhost:8080/api/v1/users" },
		websocket: { url: "ws://localhost:8085/websocket" }
	},
	auth: {
		github: {
			client_id: "49dfffa20fdaf8c5529d"
		},
		google: {
			client_id: "1034816257353-9on087jmdlgqsh3rce5gdu1f2oouvgo0.apps.googleusercontent.com"
		},
		facebook: {
			client_id: "543561462440557"
		},
		redirect_uri: "http://localhost:8080/app/views/login_result.html"
	}
};
