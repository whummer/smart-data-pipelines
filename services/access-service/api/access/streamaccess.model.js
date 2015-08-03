'use strict';

var mongoose = global.mongoose || require('mongoose');
var Schema = mongoose.Schema;


var template = {
	"_id": { type: String, default: genShortUUID}
};
/**
 * ID of the stream source that this access refers to.
 */
template[SOURCE_ID] = String;
/**
 * ID of the user (or organization) who provides this stream.
 */
template[PROVIDER_ID] = String;
/**
 * ID of the organization who requests access.
 *
 * Note that only the requesting organization is visible to 
 * the owner, i.e., the identity of the actual user behind 
 * this organization is not revealed.
 */
template[REQUESTOR_ID] = String;
/**
 * Creation date of this access request.
 */
template[CREATED] = Date;
/**
 * Last change date.
 */
template[CHANGED] = Date;
/**
 * Status of this stream access: REQUESTED, PERMITTED, or DENIED.
 */
template[STATUS] = { type: String, enum: [ STATUS_REQUESTED, STATUS_PERMITTED, STATUS_DENIED ] };


var StreamAccessSchema = new Schema(template);
StreamAccessSchema.set('toJSON', { virtuals: true });
StreamAccessSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('StreamAccess', StreamAccessSchema);
