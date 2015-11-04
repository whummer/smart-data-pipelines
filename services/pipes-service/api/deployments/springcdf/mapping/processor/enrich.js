
'use strict';
var log = global.log || require('winston');
var util = require('util');
var Promise = require('bluebird');

module.exports = function (connector, args) {
	log.debug('springxd.processor.enricher-csv');

	// build the basic string
	let stream = util.format(
			'queue:%s > ' +
			'enricher-csv ' +
			'--csv.location=%s ' +
			'--csv.sourceID=%s ' +
			'--csv.targetID=%s ' +
			'--csv.mappings=\'%s\' ',
			args.previous_id,
			args[PARAMS].url,
			args[PARAMS].sourceID,
			args[PARAMS].targetID,
			args[PARAMS].mappings
	);

	if (args[PARAMS].overwrite) {
		stream = stream + util.format('--csv.overwrite=%s ', args[PARAMS].overwrite);
	}
	if (args[PARAMS].flat) {
		stream = stream + util.format('--csv.flat=%s ', args[PARAMS].flat);
	}
	if (args[PARAMS].cache) {
		stream = stream + util.format('--csv.cache=\'%s\' ', args[PARAMS].cache);
	}
	if (args[PARAMS].columns) {
		stream = stream + util.format('--csv.columns=\'%s\' ', args[PARAMS].columns);
	}
	stream = stream + util.format('> queue:%s', args.next_id);

	if (args.dryrun) {
		log.info('stream (dry-run): ', stream);
		return Promise.resolve(stream);
	} else {
		let streamId = connector.getStreamIdForPipeElement(args);
		return connector.createStream(streamId, stream);
	}
};
