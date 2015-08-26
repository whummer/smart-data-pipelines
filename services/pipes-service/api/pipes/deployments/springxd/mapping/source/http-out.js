'use strict';
var log = global.log || require('winston');
var util = require('util');
var Promise = require('bluebird');

module.exports = function (xdConnector, args) {
	log.debug('SpringXdTransformer.source_http_out');
	let stream = util.format('trigger --fixedDelay=%d | http-client '
														+ '--url=\'\'\'%s\'\'\' --httpMethod=%s > queue:%s',
														args.options.interval || 30,
														args.options.url,
														args.options.method || 'GET',
														args.next_id);

	if (args.dryrun || false) {
		log.info('stream (dry-run): ', stream);
		return Promise.resolve(stream);
	} else {
		let streamId = args.environment + '_source_http_out_' + args.id;
		return xdConnector.createStream(streamId, stream);
	}
};
