
'use strict';
var log = global.log || require('winston');
var util = require('util');
var Promise = require('bluebird');

module.exports = function (connector, args) {
	log.debug('springxd.processor.script');
	let stream = util.format(
			'queue:%s > ' +
			'groovy-transform ' +
			'--script=%s ' +
			'--variables="' + transformVariables(args[PARAMS].variables) + '" ',
			args.previous_id,
			args[PARAMS].location);

	if (args[PARAMS].variablesLocation) {
		stream = stream + util.format('--variablesLocation=%s ', args[PARAMS].variablesLocation);
	}
	stream = stream + util.format('> queue:%s', args.next_id);

	if (args.dryrun) {
		log.info('stream (dry-run): ', stream);
		return Promise.resolve(stream);
	} else {
		let streamId = connector.getStreamIdForPipeElement(args);
		return connector.createStream(streamId, stream);
	}
};

function transformVariables(variables) {
	let val = JSON.stringify(variables).replace(/\":\"/g, "=").replace(/\"|\{|\}/g, "");
	val = "";
	var separator = " $'\\n' ";
	for(var key in variables) {
		val += key + '=' + variables[key] + separator;
	}
	val = val.substring(0, val.length - separator.length);
	//val = val.replace(/\\\\/g, '\\'); // FIXME this is dangerous
	return val;
}
