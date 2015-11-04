'use strict';
var log = global.log || require('winston');
var util = require('util');
var Promise = require('bluebird');

module.exports = function (pipeElement, user) {

	/* PART 1 : TIME module*/

	var timeMod = {};
	timeMod.coordinates = {
			groupId: "riox",
			artifactId: "time-source",
			version: "1.0.0.BUILD-SNAPSHOT"
	};

	/* set cmd args */
	timeMod.cmdArgs = [];
	timeMod.cmdArgs.push(util.format('--fixedDelay=%d', pipeElement[PARAMS].interval));

	/* set environment variables */
	timeMod.env = {};
	timeMod.env.JAVA_TOOL_OPTIONS = "-Xmx80M";

	/* set ID of this module */
	timeMod[ID] = pipeElement[ID] + "-1";

	/* PART 2 : HTTP module*/

	var httpMod = {};
	httpMod.coordinates = {
			groupId: "riox",
			artifactId: "httpclient-processor",
			version: "1.0.0.BUILD-SNAPSHOT"
	};

	/* set cmd args */
	httpMod.cmdArgs = [];
	httpMod.cmdArgs.push(util.format("--url='%s'", pipeElement[PARAMS].url));
	httpMod.cmdArgs.push(util.format("--httpMethod=%s", pipeElement[PARAMS].method || "GET"));

	/* set ID of this module */
	httpMod[ID] = pipeElement[ID] + "-2";

	/* set environment variables */
	httpMod.env = {};
	httpMod.env.JAVA_TOOL_OPTIONS = "-Xmx200M";

	/* return the result as an array */
	return Promise.resolve([timeMod, httpMod]);
};

