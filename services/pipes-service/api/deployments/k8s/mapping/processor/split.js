'use strict';
var log = global.log || require('winston');
var util = require('util');
var Promise = require('bluebird');

module.exports = function (pipeElement, user) {

	var mod = {};
	mod.coordinates = {
			groupId: "riox",
			artifactId: "split-processor",
			version: "1.0.0.BUILD-SNAPSHOT"
	};

	/* set cmd args */
	mod.cmdArgs = [];
	mod.cmdArgs.push(util.format('--mapping=%s', pipeElement[PARAMS].mapping));

	/* set ID of this module */
	mod[ID] = pipeElement[ID];

	/* set environment variables */
	mod.env = {};
	mod.env.JAVA_TOOL_OPTIONS = "-Xmx80M";

	/* return the result as an array */
	return Promise.resolve([mod]);
};
