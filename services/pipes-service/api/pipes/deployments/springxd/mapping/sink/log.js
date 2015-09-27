'use strict';
var log = global.log || require('winston');
var util = require('util');
var Promise = require('bluebird');

module.exports = function (xdConnector, args) {
	log.debug('springxd.sink.log');
	let stream = util.format('queue:%s > '
			+ 'log',
			args.previous_id);

	if (args.dryrun) {
		log.info('stream (dry-run): ', stream);
		return Promise.resolve(stream);
	} else {
		let streamId = args.environment + '_sink_log_visualization_' + args.id;
		return xdConnector.createStream(streamId, stream);
	}
};
