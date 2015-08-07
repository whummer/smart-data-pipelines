/**
 * Implements a basic transformer from the Riox Smart Data Pipeline elements
 * to SpringXD streams. The idea is that each SDP element is represented as a
 * function that know how to transform itself to Spring XD.
 *
 */
'use strict';
var log = global.log || require('winston');
var xdConnector = require('../../springxd.connector');
var util = require('util');

module.exports = function (args, callback, errorCallback) {
  log.debug("springxd.sink.map_visualization");
  var stream = util.format("queue:%s >"
                          + "elasticsearch --mode=transport --guessSchemas=true "
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
  } else {
    // TODO fix id
    xdConnector.createStream("sink_map_visualization" + args.id, stream, callback, errorCallback);
  }
};
