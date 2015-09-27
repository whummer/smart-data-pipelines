'use strict';
var log = global.log || require('winston');
var util = require('util');
var Promise = require('bluebird');

module.exports = function (xdConnector, args) {
	log.debug('springxd.source.websocket');
	let stream = util.format(
			'websocket --port=%s' +
			' > queue:%s',
			args[PARAMS].port,
			args.next_id);

	if (args.dryrun) {
		log.info('stream (dry-run): ', stream);
		return Promise.resolve(stream);
	} else {
		let streamId = args.environment + '_source_websocket_' + args.id;
		return xdConnector.createStream(streamId, stream);
	}
};
