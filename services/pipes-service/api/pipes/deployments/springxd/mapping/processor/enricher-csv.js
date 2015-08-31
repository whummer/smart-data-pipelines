
'use strict';
var log = global.log || require('winston');
var util = require('util');
var Promise = require('bluebird');

module.exports = function (xdConnector, args) {
	log.debug('springxd.processor.enricher-csv');

	// build the basic string
	let stream = util.format('queue:%s > enricher-csv ' +
													 '--url=%s ' +
													 '--columns=%s ' +
													 '--sourceID=%s ' +
													 '--targetID=%s ' +
													 '--mappings=\'%s\' ',
														args.previous_id,
														args.options.url,
														args.options.columns || '\'\'',
														args.options.sourceID,
														args.options.targetID,
														args.options.mappings
													);

	if (args.options.overwrite) {
		stream = stream + util.format('--overwrite=%s ', args.options.overwrite);
	}
	if (args.options.flat) {
		stream = stream + util.format('--flat=%s ', args.options.flat);
	}
	if (args.options.cache) {
		stream = stream + util.format('--cache=\'%s\' ', args.options.cache);
	}
	stream = stream + util.format('> queue:%s', args.next_id);

	if (args.dryrun) {
		log.info('stream (dry-run): ', stream);
		return Promise.resolve(stream);
	} else {
		let streamId = args.environment + '_processor_enricher-csv_' + args.id;
		return xdConnector.createStream(streamId, stream);
	}
};
