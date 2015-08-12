
'use strict';
var log = global.log || require('winston');
var xdConnector = require('../../springxd.connector');
var util = require('util');

module.exports = function (args, callback, errorCallback) {
	log.debug("springxd.processor.script");
	var stream = util.format("queue:%s > script --script=%s --variables=%s > queue:%s",
													 args.previous_id,
													 args.options.location,
													 transformVariables(args.options.variables),
													 args.next_id);
	if (args.dryrun) {
		log.info("stream (dry-run): ", stream);
		callback(stream);
	} else {
		// TODO fix ID
		xdConnector.createStream("processor_script" + args.id, stream, callback, errorCallback);
	}
};

function transformVariables(variables) {
	var val = JSON.stringify(variables).replace(/\":\"/g, "=").replace(/\"|\{|\}/g, "");
	return util.format("'%s'", val);
}
