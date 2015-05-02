var services = {};

exports.startStreamsService = function() {
	if(!services.streams) {
		services.streams = { port : 3000, sinks: {}, sources: {}, processors: {} };
		services.streams.url = global.servicesConfig.services.streams.url =
			"http://localhost:" + services.streams.port + "/api/v1/streams";
		services.streams.sources.url = global.servicesConfig.services.streamsources.url = services.streams.url + "/sources";
		services.streams.sinks.url = global.servicesConfig.services.streamsinks.url = services.streams.url + "/sinks";
		services.streams.processors.url = global.servicesConfig.services.streamprocessors.url = services.streams.url + "/processors";
		process.env.SERVICE_PORT = services.streams.port;
		services.streams.server = require('../../../streams-service/app.js').start();
	}
	return services.streams;
}

exports.startStreamsAccessService = function() {
	if(!services.access) {
		services.access = { port : 3000 };
		services.access.url = global.servicesConfig.services.access.url =
			"http://localhost:" + services.access.port + "/api/v1/access";
		process.env.SERVICE_PORT = services.access.port;
		services.access.server = require('../../../streams-service/app.js').start();
	}
	return services.access;
}

exports.startUsersService = function() {
	if(!services.users) {
		services.users = { port : 3001 };
		services.users.url = global.servicesConfig.services.users.url =
			"http://localhost:" + services.users.port + "/api/v1/users";
		process.env.SERVICE_PORT = services.users.port;
		services.users.server = require('../../../users-service/app.js').start();
	}
	return services.users;
}

exports.startOrganizationsService = function() {
	if(!services.organizations) {
		services.organizations = { port : 3001 };
		services.organizations.url = global.servicesConfig.services.organizations.url =
			"http://localhost:" + services.organizations.port + "/api/v1/organizations";
		process.env.SERVICE_PORT = services.organizations.port;
		services.organizations.server = require('../../../users-service/app.js').start();
	}
	return services.organizations;
}
