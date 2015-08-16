'use strict';
var log = global.log || require('winston');
var xdConnector = require('../../springxd.connector');
var util = require('util');
var Promise = require('bluebird');

module.exports = function (args) {
	log.debug("SpringXdTransformer.source_http_out");
	var stream = util.format("trigger --fixedDelay=%d | http-client "
												 + "--url='''%s''' --httpMethod=%s > queue:%s",
												 args.options.interval || 30,
												 args.options.url,
												 args.options.method || "GET",
												 args.next_id);

	if (args.dryrun || false) {
		log.info("stream (dry-run): ", stream);
		return Promise.resolve(stream);
	} else {
		// TODO we need to manage IDs for each individual stream
		return xdConnector.createStream("source_http_out_" + args.id, stream);
	}
};
