'use strict';

var mongoose = global.mongoose || require('mongoose');
var Schema = mongoose.Schema;

var template = {
	"_id": { type: String, unique: true, default: genShortUUID}
};


/**
 * ID of the consumer that this limit applies to.
 */
template[CONSUMER_ID] = String;
/**
 * ID of the role that this limit applies to.
 */
template[ACCESSROLE_ID] = String;
/**
 * ID of the operation that this limit applies to.
 */
template[OPERATION_ID] = String;
/**
 * Limit type. Typically a value for "number of requests".
 */
template[TYPE] = String;
/**
 * Limit type.
 */
template[TIMEUNIT] = {type: String, enum: 
	[TIMEUNIT_MINUTE, TIMEUNIT_HOUR, TIMEUNIT_DAY, TIMEUNIT_MONTH]
};
/**
 * Numeric amount of this limit.
 */
template[AMOUNT] = Number;
/**
 * Creation date.
 */
template[CREATION_DATE] = Date;
/**
 * Creating user.
 */
template[CREATOR_ID] = String;


var RateLimitSchema = new Schema(template);
RateLimitSchema.set('toJSON', { virtuals: true });
RateLimitSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('RateLimit', RateLimitSchema);
