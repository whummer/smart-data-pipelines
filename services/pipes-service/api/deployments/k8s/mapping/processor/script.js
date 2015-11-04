'use strict';
var log = global.log || require('winston');
var util = require('util');
var riox = require('riox-shared/lib/api/riox-api');
var auth = require('riox-services-base/lib/auth/auth.service');
var Promise = require('bluebird');

module.exports = function (pipeElement, user) {

	var mod = {};
	mod.coordinates = {
			groupId: "riox",
			artifactId: "groovy-transform-processor",
			version: "1.0.0.BUILD-SNAPSHOT"
	};

	/* set cmd args */
	mod.cmdArgs = [];
	mod.cmdArgs.push(util.format('--script=%s', pipeElement[PARAMS].location));
	if (pipeElement[PARAMS].variablesLocation) {
		mod.cmdArgs.push(util.format('--variablesLocation=%s', pipeElement[PARAMS].variablesLocation));
	}

	/* set ID of this module */
	mod[ID] = pipeElement[ID];

	/* set environment variables */
	mod.env = {};
	mod.env.JAVA_TOOL_OPTIONS = "-Xmx128M";

	var doUploadVarsFile = true;
	if(doUploadVarsFile) {
		return uploadVariablesFile(pipeElement[PARAMS].variables).then(function(location) {
			//console.log("location", location);
			mod.cmdArgs.push(util.format('--variablesLocation=%s', location));
			return Promise.resolve([mod]);
		});
	} else {
		mod.cmdArgs.push(util.format('--variables=%s', transformVariables(pipeElement[PARAMS].variables)));
	}

	/* return the result as an array */
	return Promise.resolve([mod]);
};

function transformVariables(variables) {
	let val = JSON.stringify(variables).replace(/\":\"/g, "=").replace(/\"|\{|\}/g, "");
	val = "";
	var separator = " $'\\n' ";
	for(var key in variables) {
		val += key + '=' + variables[key] + separator;
	}
	val = val.substring(0, val.length - separator.length);
	return val;
}

function uploadVariablesFile(variables) {
	return new Promise(function(resolve, reject) {
		var val = "";
		var separator = "\n";
		for(var key in variables) {
			val += key + '=' + variables[key] + separator;
		}
		val = val.substring(0, val.length - separator.length);
		riox.add.file(val, {
			headers: auth.getInternalCallTokenHeader(), // TODO use auth token of calling user here?
			callback: function(result) {
				var location = global.servicesConfig.files.url + "/" + result.fileID;
				resolve(location);
			}
		});
		return val;
	});
}
