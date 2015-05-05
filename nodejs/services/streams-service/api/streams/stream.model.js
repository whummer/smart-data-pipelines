'use strict';

var mongoose = global.mongoose || require('mongoose');
var Schema = mongoose.Schema;

var template = {
	"_id": { type: String, default: genShortUUID}
};
/**
 * Name.
 */
template[NAME] = String;
/**
 * Creator.
 */
template[CREATOR_ID] = String;
/**
 * Creation Date.
 */
template[CREATION_DATE] = Date;
/**
 * Description.
 */
template[DESCRIPTION] = Date;
/**
 * Source of this stream.
 */
template[SOURCE_ID] = String;
/**
 * List of IDs of StreamProcessors of this stream.
 */
template[PROCESSORS] = String;
/**
 * Sink of this stream.
 */
template[SINK_ID] = String;


var Stream = new Schema(template);
Stream.set('toJSON', { virtuals: true });
Stream.set('toObject', { virtuals: true });

module.exports = mongoose.model('Stream', Stream);
