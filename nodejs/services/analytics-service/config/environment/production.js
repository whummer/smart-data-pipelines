'use strict';

// Production specific configuration
// =================================
module.exports = {

	// Server IP
	ip:		process.env.IP ||
			undefined,

	// Server port
	port:	process.env.PORT ||
			8080,

	// MongoDB connection options
	mongo: {
		uri: appConfig.infra.mongodb.url
	}

};