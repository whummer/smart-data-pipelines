
'use strict';
var log = global.log || require('winston');
var xdConnector = require('../../springxd.connector');
var util = require('util');
var Promise = require('bluebird');

module.exports = function (args) {
	log.debug("springxd.processor.script");
	var stream = util.format("queue:%s > script --script=%s --variables=%s > queue:%s",
													 args.previous_id,
													 args.options.location,
													 transformVariables(args.options.variables),
													 args.next_id);
	if (args.dryrun) {
		log.info("stream (dry-run): ", stream);
		return Promise.resolve(stream);
	} else {
		// TODO fix ID
		return xdConnector.createStream("processor_script" + args.id, stream);
	}
};

function transformVariables(variables) {
	var val = JSON.stringify(variables).replace(/\":\"/g, "=").replace(/\"|\{|\}/g, "");
	return util.format("'%s'", val);
}
