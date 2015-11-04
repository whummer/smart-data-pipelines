'use strict';
var log = global.log || require('winston');
var util = require('util');
var Promise = require('bluebird');

module.exports = function (connector, args) {
	log.debug('springxd.processor.split');

	let stream = util.format(
			'queue:%s > ' + 
			'split --mapping=\'%s\' ' +
			'> queue:%s',
			args.previous_id,
			args[PARAMS].mapping,
			args.next_id);

	if (args.dryrun) {
		log.info('stream (dry-run): ', stream);
		return Promise.resolve(stream);
	} else {
		let streamId = connector.getStreamIdForPipeElement(args);
		return connector.createStream(streamId, stream);
	}
};
