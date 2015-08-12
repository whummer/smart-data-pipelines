/**
 * global services/endpoint configurations
 */

var domain = "svc.cluster.local";

var getHost = function(env, service) {
	if(service == "riox-ui-frontend") {
		var uiFrontends = {
				"production": "platform.riox.io",
				"staging": "demo.riox.io",
				"test": "gateway.test." + domain,
				"development": "gateway.development." + domain
		};
		return uiFrontends[env];
	}
	return service + "." + env + "." + domain;
}

var appConfig = {
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

/* define environments */

var envs = ["development", "test", "staging", "production"];

/* define environment configs */

envs.forEach(function(env) {
	appConfig[env] = {
			domain: env + "." + domain,
			services: {
				"riox-ui-frontend": { url: "http://" + getHost(env, "riox-ui-frontend") + "/" },
				"riox-ui": {		url: "http://" + getHost(env, "riox-ui") + ":8081/" },
				billing: {			url: "http://" + getHost(env, "billing-service") + ":8080/api/v1/billing" },
				users: {			url: "http://" + getHost(env, "users-service") + ":8084/api/v1/users" },
				organizations: {	url: "http://" + getHost(env, "organizations-service") + ":8084/api/v1/organizations" },
				gateway: {			url: "http://" + getHost(env, "gateway-service") + ":8088/api/v1/gateway" },
				statistics: {		url: "http://" + getHost(env, "statistics-service") + ":8088/api/v1/statistics" },
				proxies: {			url: "http://" + getHost(env, "proxies-service") + ":8088/api/v1/proxies" },
				pipes: {			url: "http://" + getHost(env, "pipes-service") + ":8085/api/v1/pipes" },
				pipesources: {		url: "http://" + getHost(env, "pipes-service") + ":8085/api/v1/pipes/sources" },
				pipesinks: {		url: "http://" + getHost(env, "pipes-service") + ":8085/api/v1/pipes/sinks" },
				pipeprocessors: {	url: "http://" + getHost(env, "pipes-service") + ":8085/api/v1/pipes/processors" },
				access: {			url: "http://" + getHost(env, "access-service") + ":8089/api/v1/access" },
				consents: {			url: "http://" + getHost(env, "consent-service") + ":8089/api/v1/consents" },
				files: {			url: "http://" + getHost(env, "files-service") + ":8087/api/v1/files" },
				notifications: {	url: "http://" + getHost(env, "notifications-service") + ":8084/api/v1/notifications" },
				analytics: {		url: "http://" + getHost(env, "analytics-service") + ":8086/api/v1/analytics" },
				certificates: {		url: "http://" + getHost(env, "certificates-service") + ":8084/api/v1/certificates" },
				pricing: {			url: "http://" + getHost(env, "pricing-service") + ":8090/api/v1/pricing" },
				ratings: {			url: "http://" + getHost(env, "ratings-service") + ":8090/api/v1/ratings" },
				websocket: {		url: "ws://" + getHost(env, "statistics-service") + ":8085/" }
			},
			infra: {
				mongodb: {
					baseurl: "mongodb://" + getHost(env, "mongo") + "/",
					url: "mongodb://" + getHost(env, "mongo") + "/riox-" + env
				},
				kafka: {
					hostname: getHost(env, "kafka")
				},
				zookeeper: {
					hostname: getHost(env, "zookeeper"),
					host: getHost(env, "zookeeper") + ":2181"
				},
				redis: {
					hostname: getHost(env, "redis"),
					url: "redis://" + getHost(env, "redis") + ":6379"
				},
				kibana: {
					url: "http://" + getHost(env, "kibana") + ":5601"
				},
				statsd: {
					hostname: getHost(env, "statsd")
				}
			}
		};
});


if(typeof module != "undefined") {
	module.exports = appConfig;
}
