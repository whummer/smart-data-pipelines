'use strict';

var mongoose = global.mongoose || require('mongoose');
var Schema = mongoose.Schema;

var template = {};

template["_id"] = { type: String, default: genShortUUID};
/**
 * Name of this stream sink.
 */
template[NAME] = String;
/**
 * Creator.
 */
template[CREATOR_ID] = String;
/**
 * Creation Date.
 */
template[CREATION_DATE] = String;
/**
 * ID of the organization under which this sink is consumed.
 */
template[ORGANIZATION_ID] = String;
/**
 * Sink description.
 */
template[DESCRIPTION] = String;
/**
 * Connector configuration, e.g., websocket, jms, ....
 */
template[CONNECTOR] = {};
template[CONNECTOR][TYPE] = { type: String };


var StreamSink = new Schema(template);
StreamSink.set('toJSON', { virtuals: true });
StreamSink.set('toObject', { virtuals: true });

module.exports = mongoose.model('StreamSink', StreamSink);
