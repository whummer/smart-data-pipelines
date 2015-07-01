'use strict';

var mongoose = global.mongoose || require('mongoose');
var Schema = mongoose.Schema;

var template = {};
template["_id"] = { type: String, unique: true, default: genShortUUID};


/**
 * ID of requesting user.
 */
template[USER_ID] = String;
/**
 * Request URL.
 */
template[URL] = String;
/**
 * Request HTTP method.
 */
template[HTTP_METHOD] = String;
/**
 * Request host.
 */
template[HOST] = String;
/**
 * Request path.
 */
template[URL_PATH] = String;
/**
 * Query part of a URL.
 */
template[URL_QUERY] = String;
/**
 * ID of the operation this invocation is made to.
 */
template[OPERATION_ID] = String;
/**
 * API Key.
 */
template[API_KEY] = String;
/**
 * Invocation time.
 */
template[TIMESTAMP] = Date;
/**
 * Source IP address of the requestor.
 */
template[SOURCE_IP] = String;
/**
 * Source country of the invocation, based on the IP address.
 */
template[SOURCE_COUNTRY] = String;
/**
 * Result status code (e.g., 200 for HTTP OK).
 */
template[RESULT_STATUS] = String;


var InvocationSchema = new Schema(template);
InvocationSchema.set('toJSON', { virtuals: true });
InvocationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Invocation', InvocationSchema);
