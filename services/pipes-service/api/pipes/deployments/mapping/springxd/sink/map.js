'use strict';
var log = global.log || require('winston');
var xdConnector = require('../../springxd.connector');
var util = require('util');
var Promise = require('bluebird');

module.exports = function (args) {
	log.debug("springxd.sink.map");
	var stream = util.format("queue:%s > "
													+ "elasticsearch --mode=transport --guessSchemas=true "
													+ "--addTimestamp=true "
													+ "--clusterName=elasticsearch "
													+ "--hosts=%s:%s "
													+ "--index=%s --type=%s",
													args.previous_id,
													config.elasticsearch.hostname,
													config.elasticsearch.port,
													args.options.index,
													args.options.type);

	if (args.dryrun) {
		log.info("stream (dry-run): ", stream);
		return Promise.resolve(stream);
	} else {
		// TODO fix id
		return xdConnector.createStream("sink_map_visualization" + args.id, stream);
	}
};
