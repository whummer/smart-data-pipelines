'use strict';
var log = global.log || require('winston');
var xdConnector = require('../../springxd.connector');
var util = require('util');

module.exports = function (args, callback, errorCallback) {
  log.debug("SpringXdTransformer.source_http_poll");
  var stream = util.format("trigger --fixedDelay=%d | http-client "
                         + "--url='''%s''' --httpMethod=%s > queue:%s",
                         args.options.interval,
                         args.options.url,
                         args.options['http-method'],
                         args.next_id);

  if (args.dryrun || false) {
    log.info("stream (dry-run): ", stream);
  } else {
    // TODO we need to manage IDs for each individual stream
    xdConnector.createStream("source_http_poll_" + args.id,
                              stream, callback, errorCallback);
  }
};
