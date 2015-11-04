'use strict';
var log = global.log || require('winston');
var util = require('util');
var Promise = require('bluebird');

'use strict';
var log = global.log || require('winston');
var util = require('util');
var Promise = require('bluebird');

module.exports = function (pipeElement, user) {

	var websocketMod = {};
	websocketMod.coordinates = {
			groupId: "riox",
			artifactId: "websocket-source",
			version: "1.0.0.BUILD-SNAPSHOT"
	};

	/* set cmd args */
	websocketMod.cmdArgs = [];
	websocketMod.cmdArgs.push(util.format('--server.port=%s', pipeElement[PARAMS].port));

	/* set ID of this module */
	websocketMod[ID] = pipeElement[ID];

	/* set environment variables */
	websocketMod.env = {};
	websocketMod.env.JAVA_TOOL_OPTIONS = "-Xmx128M";

	/* return the result as an array */
	return Promise.resolve([websocketMod]);
};
