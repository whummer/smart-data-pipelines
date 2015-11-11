'use strict';
var log = global.log || require('winston');
var util = require('util');
var Promise = require('bluebird');

module.exports = function (pipeElementFrom, pipeElementTo) {

	var mod = {};
	mod.coordinates = {
			groupId: 'riox',
			artifactId: 'bridge-processor',
			version: '1.0.2'
	};

	/* set cmd args */
	mod.cmdArgs = [];
	//mod.cmdArgs.push('--verbose');

	/* set environment variables */
	mod.env = {};

	var sourceID = pipeElementFrom[ID];
	var targetID = pipeElementTo[ID];

	mod.pipeElement = {};

	/* set previous_id and next_id fields */
	mod.previous_id = mod.pipeElement.previous_id = sourceID + '-out';
	mod.next_id = mod.pipeElement.next_id = targetID + '-in';

	/* set ID of this module */
	mod[ID] = mod.pipeElement[ID] = sourceID + '-to-' + targetID;

	/* return the result as an array */
	return Promise.resolve([mod]);
};
