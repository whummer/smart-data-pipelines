'use strict';

// plain http request client for application/x-www-form-urlencoded request (stream creation)
var request = require('request');
var config = require('../../config/environment');

exports.createStream = function (streamName, streamDefinition, callback) {
	var xdUrl = config.springxd.url + "/streams/definitions";
	console.log("Using XD URL: ", xdUrl);
	console.log('Creating XD stream "' + streamName + '" with definition: ' + streamDefinition);
	request.post(xdUrl, {form: {name: streamName, definition: streamDefinition}},
			function (error, response, body) {
				if (!error && response.statusCode == 200) {
					console.log("Could not create springxd stream: ", body);
				} else {
					console.log("Successfully created spring XD stream: ", body);
				}

				if (callback)
					callback();
			}
	);
};
