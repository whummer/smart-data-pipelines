'use strict';
var log = global.log || require('winston');
var util = require('util');
var Promise = require('bluebird');

module.exports = function (xdConnector, args, user) {
	log.debug('springxd.sink.elasticsearch');

	/* determine ES index: index name should match the 
	 * ID of one of the calling user's organizations */
	var index = args[PARAMS].index;
	if(user && !user.hasOrganization(index)) {
		index = user.getDefaultOrganization()[ID];
	}

	let stream = util.format('queue:%s > '
			+ 'elasticsearch '
			+ '--es.hosts=elasticsearch.' + process.env.RIOX_ENV + '.svc.cluster.local:9300 '
			+ '--es.mode=transport '
			+ '--es.index=%s '
			+ '--es.type=%s',
			args.previous_id,
			index,
			args[PARAMS].typeName);

	if (args.dryrun) {
		log.info('stream (dry-run): ', stream);
		return Promise.resolve(stream);
	} else {
		let streamId = args.environment + '_sink_elasticsearch_' + args.id;
		return xdConnector.createStream(streamId, stream);
	}
};
