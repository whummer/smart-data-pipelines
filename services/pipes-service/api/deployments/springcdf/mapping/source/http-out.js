'use strict';
var log = global.log || require('winston');
var util = require('util');
var Promise = require('bluebird');

module.exports = function (connector, args) {
	log.debug('source.http_out');
	let stream = util.format(
			'time --fixedDelay=%d | '
			+ 'http-client '
			+ "--url='''%s''' "
			+ '--httpMethod=%s '
			+ '> queue:%s',
			args[PARAMS].interval || 30,
			args[PARAMS].url,
			args[PARAMS].method || 'GET',
			args.next_id);

	console.log("!!! stream", stream);
	if (args.dryrun || false) {
		log.info('stream (dry-run): ', stream);
		return Promise.resolve(stream);
	} else {
		let streamId = connector.getStreamIdForPipeElement(args);
		return connector.createStream(streamId, stream);
	}
};
