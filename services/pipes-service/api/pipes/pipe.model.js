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
 * Source of this pipe.
 */
template[SOURCE_ID] = String;
/**
 * List of String IDs of PipeProcessors of this pipe.
 */
template[PROCESSORS] = [String];
/**
 * Id of this pipe.
 */
template[SINK_ID] = String;


var Pipe = new Schema(template);
Pipe.set('toJSON', { virtuals: true });
Pipe.set('toObject', { virtuals: true });

module.exports = mongoose.model('Pipe', Pipe);
