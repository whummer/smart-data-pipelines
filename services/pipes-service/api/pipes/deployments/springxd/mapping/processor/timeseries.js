


'use strict';
var log = global.log || require('winston');
var util = require('util');
var Promise = require('bluebird');

module.exports = function (xdConnector, args) {
	log.debug('springxd.processor.timeseries');
	let stream = util.format('queue:%s > timeseries ' +
													 '--interval=%s ' +
													 '--field=%s ' +
													 '--min=%s ' +
													 '--type=%s > queue:%s',
														args.previous_id,
														args.options.interval,
														args.options.field,
														args.options.min,
														args.options.type,
														args.next_id);
	if (args.dryrun) {
		log.info('stream (dry-run): ', stream);
		return Promise.resolve(stream);
	} else {
		let streamId = args.environment + '_processor_timeseries_' + args.id;
		return xdConnector.createStream(streamId, stream);
	}
};
