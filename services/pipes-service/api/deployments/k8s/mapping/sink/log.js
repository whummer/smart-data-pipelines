'use strict';
var log = global.log || require('winston');
var util = require('util');
var Promise = require('bluebird');

module.exports = function (pipeElement, user) {

	var mod = {};
	mod.coordinates = {
			groupId: "riox",
			artifactId: "log-sink",
			version: "1.0.1"
	};

	/* set cmd args */
	mod.cmdArgs = [];

	/* set ID of this module */
	mod[ID] = pipeElement[ID];

	/* return the result as an array */
	return Promise.resolve([mod]);
};
