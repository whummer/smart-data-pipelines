/**
 * global services/endpoint configurations
 */

var host = "dev.riox.internal";

var getHost = function(service) {
	return service + "." + host;
}

var appConfig = {
	services: {
		billing: {			url: "http://" + getHost("billing-service") + ":8080/api/v1/billing" },
		users: {			url: "http://" + getHost("users-service") + ":8084/api/v1/users" },
		organizations: {	url: "http://" + getHost("organizations-service") + ":8084/api/v1/organizations" },
		streams: {			url: "http://" + getHost("streams-service") + ":8085/api/v1/streams" },
		streamsources: {	url: "http://" + getHost("streams-service") + ":8085/api/v1/streams/sources" },
		streamsinks: {		url: "http://" + getHost("streams-service") + ":8085/api/v1/streams/sinks" },
		streamprocessors: {	url: "http://" + getHost("streams-service") + ":8085/api/v1/streams/processors" },
		access: {			url: "http://" + getHost("access-service") + ":8085/api/v1/access" },
		consents: {			url: "http://" + getHost("consent-service") + ":8085/api/v1/consents" },
		files: {			url: "http://" + getHost("files-service") + ":8087/api/v1/files" },
		notifications: {	url: "http://" + getHost("notifications-service") + ":8084/api/v1/notifications" },
		analytics: {		url: "http://" + getHost("analytics-service") + ":8086/api/v1/analytics" },
		certificates: {		url: "http://" + getHost("certificates-service") + ":8084/api/v1/certificates" },
		ratings: {			url: "http://" + getHost("ratings-service") + ":8085/api/v1/ratings" },
		statistics: {		url: "http://" + getHost("statistics-service") + ":8085/api/v1/statistics" },
		websocket: {		url: "ws://" + getHost("statistics-service") + ":8085/" }
	},
	auth: {
		github: {
			client_id: "49dfffa20fdaf8c5529d",
			redirect_uri: "http://platform.riox.io/#/auth/github/callback"
		},
		google: {
			client_id: "1050661890767-kbb3fu29ss0d6rpj37doi4tca1opvc38.apps.googleusercontent.com",
			redirect_uri: "http://platform.riox.io/#/auth/google/callback"
		},
		facebook: {
			client_id: "543561462440557",
			redirect_uri: "http://platform.riox.io/#/auth/facebook/callback"
		},
	}
};

if(typeof module != "undefined") {
	module.exports = appConfig;
}
