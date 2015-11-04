'use strict';
var log = global.log || require('winston');
var util = require('util');
var Promise = require('bluebird');

module.exports = function (pipeElement, user) {

	var mod = {};
	mod.coordinates = {
			groupId: "riox",
			artifactId: "csv-enricher-processor",
			version: "1.0.0.BUILD-SNAPSHOT"
	};

	/* set cmd args */
	mod.cmdArgs = [];
	mod.cmdArgs.push(util.format('--csv.location=%s', pipeElement[PARAMS].url));
	mod.cmdArgs.push(util.format('--csv.sourceID=%s', pipeElement[PARAMS].sourceID));
	mod.cmdArgs.push(util.format('--csv.targetID=%s', pipeElement[PARAMS].targetID));
	mod.cmdArgs.push(util.format('--csv.mappings=%s', pipeElement[PARAMS].mappings));
	if (pipeElement[PARAMS].overwrite) {
		mod.cmdArgs.push(util.format('--csv.overwrite=%s', pipeElement[PARAMS].overwrite));
	}
	if (pipeElement[PARAMS].flat) {
		mod.cmdArgs.push(util.format('--csv.flat=%s', pipeElement[PARAMS].flat));
	}
	if (pipeElement[PARAMS].cache) {
		mod.cmdArgs.push(util.format('--csv.cache=\'%s\'', pipeElement[PARAMS].cache));
	}
	if (typeof pipeElement[PARAMS].columns != "undefined") {
		if (pipeElement[PARAMS].columns == "") {
			mod.cmdArgs.push('--csv.columns');
		} else {
			mod.cmdArgs.push(util.format('--csv.columns=%s', pipeElement[PARAMS].columns));
		}
	}

	/* set environment variables */
	mod.env = {};
	mod.env.JAVA_TOOL_OPTIONS = "-Xmx100M";

	/* set ID of this module */
	mod[ID] = pipeElement[ID];

	/* return the result as an array */
	return Promise.resolve([mod]);
};
