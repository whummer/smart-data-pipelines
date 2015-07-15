var services = {};

var x = exports;

x.startStreamsService = function() {
	if(!services.streams) {
		services.streams = { port : 3000, sinks: {}, sources: {}, processors: {} };
		services.streams.url = global.servicesConfig.streams.url =
			"http://localhost:" + services.streams.port + "/api/v1/streams";
		services.streams.sources.url = global.servicesConfig.streamsources.url = services.streams.url + "/sources";
		services.streams.sinks.url = global.servicesConfig.streamsinks.url = services.streams.url + "/sinks";
		services.streams.processors.url = global.servicesConfig.streamprocessors.url = services.streams.url + "/processors";
		process.env.SERVICE_PORT = services.streams.port;
		services.streams.server = require('../../../streams-service/app.js');
	}
	if(!services.streams.server.started)
		services.streams.server.start();
	return services.streams;
}

x.startStreamsAccessService = function() {
	if(!services.access) {
		services.access = { port : 3000 };
		services.access.url = global.servicesConfig.access.url =
			"http://localhost:" + services.access.port + "/api/v1/access";
		x.startStreamsService();
		services.access.server = services.streams.server;
	}
	if(!services.access.server.started)
		services.access.server.start();
	return services.access;
}

x.startStreamsConsentsService = function() {
	if(!services.consents) {
		services.consents = { port : 3000 };
		services.consents.url = global.servicesConfig.consents.url =
			"http://localhost:" + services.consents.port + "/api/v1/consents";
		x.startStreamsService();
		services.consents.server = services.streams.server;
	}
	if(!services.consents.server.started)
		services.consents.server.start();
	return services.consents;
}

x.startUsersService = function() {
	if(!services.users) {
		services.users = { port : 3001 };
		services.users.url = global.servicesConfig.users.url =
			"http://localhost:" + services.users.port + "/api/v1/users";
		process.env.SERVICE_PORT = services.users.port;
		services.users.server = require('../../../users-service/app.js');
	}
	if(!services.users.server.started)
		services.users.server.start();
	return services.users;
}

x.startOrganizationsService = function() {
	if(!services.organizations) {
		services.organizations = { port : 3001 };
		services.organizations.url = global.servicesConfig.organizations.url =
			"http://localhost:" + services.organizations.port + "/api/v1/organizations";
		process.env.SERVICE_PORT = services.organizations.port;
		services.organizations.server = require('../../../users-service/app.js');
	}
	if(!services.organizations.server.started)
		services.organizations.server.start();
	return services.organizations;
}

x.startFilesService = function() {
	if(!services.files) {
		services.files = { port : 3004 };
		services.files.url = global.servicesConfig.files.url =
			"http://localhost:" + services.files.port + "/api/v1/files";
		process.env.SERVICE_PORT = services.files.port;
		services.files.server = require('../../../files-service/app.js');
	}
	if(!services.files.server.started)
		services.files.server.start();
	return services.files;
}

x.startAnalyticsService = function(callback) {
	var exists = !!services.analytics;
	if(!exists) {
		services.analytics = { port : 3005 };
		services.analytics.url = global.servicesConfig.analytics.url =
			"http://localhost:" + services.analytics.port + "/api/v1/analytics";
		process.env.SERVICE_PORT = services.analytics.port;
		services.analytics.server = require('../../../analytics-service/app.js');
		if(callback) services.analytics.server.startedPromise.then(callback);
	}
	if(!services.analytics.server.started)
		services.analytics.server.start();
	if(exists && callback) {
		callback();
	}
	return services.analytics;
}

