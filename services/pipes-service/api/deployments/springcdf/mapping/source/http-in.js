'use strict';
var log = global.log || require('winston');
var util = require('util');
var Promise = require('bluebird');

module.exports = function (connector, args) {
	log.debug('SpringXdTransformer.source_http_in');
	let stream = util.format('http '
					+ '--server.port=%s '
					+ '> queue:%s',
					args[PARAMS].port,
					args.next_id);

	if (args.dryrun || false) {
		log.info('stream (dry-run): ', stream);
		return Promise.resolve(stream);
	} else {
		let streamId = connector.getStreamIdForPipeElement(args);
		return connector.createStream(streamId, stream);
	}
};
