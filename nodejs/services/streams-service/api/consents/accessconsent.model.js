'use strict';

var mongoose = global.mongoose || require('mongoose');
var Schema = mongoose.Schema;


var template = {
	"_id": { type: String, default: genShortUUID}
};


/**
 * ID of the stream source that this consent refers to.
 */
template[SOURCE_ID] = String;
/**
 * ID of the user or organization who provides the data stream source.
 */
template[PROVIDER_ID] = String;
/**
 * ID of the organization who requests access.
 */
template[REQUESTOR_ID] = String;
/**
 * ID of the user who has to provide this consent.
 */
template[CONSENTOR_ID] = String;
/**
 * Creation date of this access request.
 */
template[CREATED] = Date;
/**
 * Last change date.
 */
template[CHANGED] = Date;
/**
 * Status of this consent: REQUESTED, PERMITTED, or DENIED.
 */
template[STATUS] = { type: String, enum: [ STATUS_REQUESTED, STATUS_PERMITTED, STATUS_DENIED ] };


var AccessConsentSchema = new Schema(template);
AccessConsentSchema.set('toJSON', { virtuals: true });
AccessConsentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('AccessConsent', AccessConsentSchema);
