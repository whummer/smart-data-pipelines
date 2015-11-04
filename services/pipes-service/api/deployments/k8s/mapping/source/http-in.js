'use strict';
var log = global.log || require('winston');
var util = require('util');
var Promise = require('bluebird');

module.exports = function (pipeElement, user) {

	var httpIn = {};
	httpIn.coordinates = {
			groupId: "riox",
			artifactId: "http-source",
			version: "1.0.0.BUILD-SNAPSHOT"
	};

	/* set cmd args */
	httpIn.cmdArgs = [];
	httpIn.cmdArgs.push(util.format('--server.port=%s', pipeElement[PARAMS].port));

	/* set ID of this module */
	httpIn[ID] = pipeElement[ID];

	/* set environment variables */
	httpIn.env = {};
	httpIn.env.JAVA_TOOL_OPTIONS = "-Xmx256M";

	/* return the result as an array */
	return Promise.resolve([httpIn]);
};
