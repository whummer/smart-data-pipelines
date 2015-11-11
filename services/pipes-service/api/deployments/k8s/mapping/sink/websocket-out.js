'use strict';
var log = global.log || require('winston');
var util = require('util');
var Promise = require('bluebird');


module.exports = function (pipeElement, user) {

	var mod = {};
	mod.coordinates = {
			groupId: "riox",
			artifactId: "websocket-sink",
			version: "1.0.0.BUILD-SNAPSHOT"
	};

	/* set cmd args */
	mod.cmdArgs = [];
	mod.cmdArgs.push(util.format('--ws.port=%s', pipeElement[PARAMS].port));

	/* set ID of this module */
	mod[ID] = pipeElement[ID];

	/* set environment variables */
	mod.env = {};
	mod.env.JAVA_TOOL_OPTIONS = "-Xmx300M";

	/* return the result as an array */
	return Promise.resolve([mod]);
};
