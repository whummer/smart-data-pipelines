'use strict';

var mongoose = global.mongoose || require('mongoose');
var Schema = mongoose.Schema;

var template = {
	"_id": { type: String, default: genShortUUID}
};

/**
 * Name of this consumer.
 */
template[NAME] = String;
/**
 * Access role of this consumer.
 */
template[ACCESSROLE_ID] = String;
/**
 * ID of the source (API) that this consumer consumes.
 */
template[SOURCE_ID] = String;
/**
 * List of API keys to identify this consumer (and their developers/users).
 */
template[API_KEYS] = [String];
/**
 * Creation date of this access request.
 */
template[CREATION_DATE] = Date;


var ConsumerSchema = new Schema(template);
ConsumerSchema.set('toJSON', { virtuals: true });
ConsumerSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Consumer', ConsumerSchema);

