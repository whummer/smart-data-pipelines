
'use strict';
var log = global.log || require('winston');
var util = require('util');
var Promise = require('bluebird');

module.exports = function (xdConnector, args) {
	log.debug('springxd.processor.script');
	let stream = util.format('queue:%s > script --script=%s --variables=\'%s\' > queue:%s',
														args.previous_id,
														args.options.location,
														transformVariables(args.options.variables),
														args.next_id);
	if (args.dryrun) {
		log.info('stream (dry-run): ', stream);
		return Promise.resolve(stream);
	} else {
		let streamId = args.environment + '_processor_script_' + args.id;
		return xdConnector.createStream(streamId, stream);
	}
};

function transformVariables(variables) {
	let val = JSON.stringify(variables).replace(/\":\"/g, "=").replace(/\"|\{|\}/g, "");
	return util.format('%s', val);
}
