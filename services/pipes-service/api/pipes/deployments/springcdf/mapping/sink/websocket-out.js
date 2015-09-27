'use strict';
var log = global.log || require('winston');
var util = require('util');
var Promise = require('bluebird');

module.exports = function (xdConnector, args) {
	log.debug('springxd.sink.websocket');
	let stream = util.format('queue:%s > '
			+ 'websocket --port=%s',
			args.previous_id,
			args[PARAMS].port);

	if (args.dryrun) {
		log.info('stream (dry-run): ', stream);
		return Promise.resolve(stream);
	} else {
		let streamId = args.environment + '_sink_websocket_' + args.id;
		return xdConnector.createStream(streamId, stream);
	}
};
