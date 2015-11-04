'use strict';
var log = global.log || require('winston');
var util = require('util');
var Promise = require('bluebird');

module.exports = function (pipeElement, user) {

	/* determine ES index: index name should match the 
	 * ID of one of the calling user's organizations */
	var index = pipeElement[PARAMS].index;
	if(!index || (user && !user.hasOrganization(index))) {
		var dfltOrg = user.getDefaultOrganization();
		index = dfltOrg[ID];
	}

	var mod = {};
	mod.coordinates = {
			groupId: "riox",
			artifactId: "elasticsearch-sink",
			version: "1.0.0.BUILD-SNAPSHOT"
	};

	/* set cmd args */
	var host = 'elasticsearch.' + process.env.RIOX_ENV + '.svc.cluster.local:9300';
	mod.cmdArgs = [];
	mod.cmdArgs.push(util.format('--es.hosts=%s', host));
	mod.cmdArgs.push(util.format('--es.mode=transport'));
	mod.cmdArgs.push(util.format('--es.index=%s', index));
	mod.cmdArgs.push(util.format('--es.type=%s', pipeElement[PARAMS].typeName));
	mod.cmdArgs.push(util.format('--es.timestamp=%s', pipeElement[PARAMS].timestamp));

	/* set ID of this module */
	mod[ID] = pipeElement[ID];

	/* set environment variables */
	mod.env = {};
	mod.env.JAVA_TOOL_OPTIONS = "-Xmx350M";

	/* return the result as an array */
	return Promise.resolve([mod]);
};
