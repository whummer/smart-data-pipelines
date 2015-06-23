'use strict';

var mongoose = global.mongoose || require('mongoose');
var Schema = mongoose.Schema;

var template = {
	"_id": { type: String, unique: true, default: genShortUUID}
};


/**
 * Request URL.
 */
template[URL] = String;
/**
 * Request HTTP method.
 */
template[HTTP_METHOD] = String;
/**
 * API Key.
 */
template[API_KEY] = String;
/**
 * Invocation time.
 */
template[TIMESTAMP] = String;
/**
 * Source IP address of the requestor.
 */
template[SOURCE_IP] = String;


var InvocationSchema = new Schema(template);
InvocationSchema.set('toJSON', { virtuals: true });
InvocationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Invocation', InvocationSchema);
