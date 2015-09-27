
'use strict';
var log = global.log || require('winston');
var util = require('util');
var Promise = require('bluebird');

module.exports = function (xdConnector, args) {
	log.debug('springxd.processor.transform');

	let stream = util.format('queue:%s > ' + 
			't1: transform ' +
			'| t2: transform ' + // TODO: currently needed due to bug in SCDF
			'> queue:%s',
				args.previous_id,
				args.next_id
			);

	if (args.dryrun) {
		log.info('stream (dry-run): ', stream);
		return Promise.resolve(stream);
	} else {
		let streamId = args.environment + '_processor_transform_' + args.id;
		return xdConnector.createStream(streamId, stream);
	}
};
