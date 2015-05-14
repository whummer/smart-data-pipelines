/**
 * global services/endpoint configurations
 */
var appConfig = {
	services: {
		core: { 			url: "http://localhost:8080/api/v1" },
		billing: { 			url: "http://localhost:8080/api/v1/billing" },
		users: { 			url: "http://localhost:8084/api/v1/users" },
		organizations: { 	url: "http://localhost:8084/api/v1/organizations" },
		streams: { 			url: "http://localhost:8085/api/v1/streams" },
		streamsources: { 	url: "http://localhost:8085/api/v1/streams/sources" },
		streamsinks: { 		url: "http://localhost:8085/api/v1/streams/sinks" },
		streamprocessors: {	url: "http://localhost:8085/api/v1/streams/processors" },
		access: { 			url: "http://localhost:8085/api/v1/access" },
		consents: { 		url: "http://localhost:8085/api/v1/consents" },
		files: { 			url: "http://localhost:8087/api/v1/files" },
		notifications: { 	url: "http://localhost:8084/api/v1/notifications" },
		analytics: { 		url: "http://localhost:8086/api/v1/analytics" },
		websocket: { 		url: "ws://platform.riox.io:9001/" }
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
