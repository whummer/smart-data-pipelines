
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
			args[PARAMS].url,
			args[PARAMS].columns || '\'\'',
			args[PARAMS].sourceID,
			args[PARAMS].targetID,
			args[PARAMS].mappings
		);

	if (args[PARAMS].overwrite) {
		stream = stream + util.format('--overwrite=%s ', args[PARAMS].overwrite);
	}
	if (args[PARAMS].flat) {
		stream = stream + util.format('--flat=%s ', args[PARAMS].flat);
	}
	if (args[PARAMS].cache) {
		stream = stream + util.format('--cache=\'%s\' ', args[PARAMS].cache);
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
