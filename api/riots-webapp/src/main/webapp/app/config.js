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
		categories: { url: "/api/v1/categories" },
		semanticTypes: { url: "/api/v1/semantic-types" },
		simulations: { url: "/api/v1/simulations" },
		ratings: { url: "/api/v1/ratings" },
		simulationProps: { url: "/api/v1/simulations/properties" },
		simulationDevices: { url: "/api/v1/simulations/devices" },
		simulationTypes: { url: "/api/v1/simulations/types" },
		stats: { url: "/api/v1/stats" },
		users: { url: "/api/v1/users" },
		utils: { url: "/api/v1/utils" },
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
		redirect_uri: "http://platform.riots.io:8080/app/views/login_result.html"
	}
};
