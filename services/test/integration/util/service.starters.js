var services = {};

var x = exports;


var ensureMockgoose = x.ensureMockgoose = function() {
	var mongoose = global.mongoose || require('mongoose-q')();
	if (!global.mongoose) {
		global.mongoose = mongoose;
	}
	if (!mongoose.__mockgooseHasBeenApplied) {
		console.log("Enabling mockgoose for TEST mode");
		var mockgoose = require('mockgoose');
		mockgoose(mongoose);
		mongoose.connect("");
		mongoose.__mockgooseHasBeenApplied = true;
	}
};

x.startUsersService = function() {
	if(!services.users) {
		/* make sure we use mockgoose as DB */
		ensureMockgoose();
		/* prepare and run service */
		services.users = { port : 3003 };
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
		/* make sure we use mockgoose as DB */
		ensureMockgoose();
		/* prepare and run service */
		services.organizations = { port : 3003 };
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
		/* make sure we use mockgoose as DB */
		ensureMockgoose();
		/* prepare and run service */
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
		/* make sure we use mockgoose as DB */
		ensureMockgoose();
		/* prepare and run service */
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

x.startPipesService = function() {
	if(!services.pipes) {
		/* make sure we use mockgoose as DB */
		ensureMockgoose();

		services.pipes = { port : 3002, deployments: {} };
		services.pipes.url = global.servicesConfig.pipes.url =
			"http://localhost:" + services.pipes.port + "/api/v1/pipes";
		services.pipes.deployments.url
			= global.servicesConfig.pipedeployments.url
			= services.pipes.url + "/deployments";

		process.env.SERVICE_PORT = services.pipes.port;
		services.pipes.server = require('../../../pipes-service/app.js');
	}
	if(!services.pipes.server.started)
		services.pipes.server.start();
	return services.pipes;
}
