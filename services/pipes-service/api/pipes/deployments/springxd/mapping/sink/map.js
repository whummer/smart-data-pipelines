'use strict';
var log = global.log || require('winston');
var util = require('util');
var Promise = require('bluebird');

module.exports = function (xdConnector, args) {
	log.debug('springxd.sink.map');
	let stream = util.format('queue:%s > '
			+ 'elasticsearch --mode=transport --guessSchemas=true '
			+ '--addTimestamp=true '
			+ '--clusterName=elasticsearch '
			+ '--hosts=%s:%s '
			+ '--index=%s --type=%s',
			args.previous_id,
			config.elasticsearch.hostname,
			config.elasticsearch.port,
			args[PARAMS].index,
			args[PARAMS].type);

	if (args.dryrun) {
		log.info('stream (dry-run): ', stream);
		return Promise.resolve(stream);
	} else {
		let streamId = args.environment + '_sink_map_visualization_' + args.id;
		return xdConnector.createStream(streamId, stream);
	}
};
