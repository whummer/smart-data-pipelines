'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var template = {
	"_id": { type: String, default: genShortUUID},
	/**
	 * ID of the stream that this access refers to.
	 */
	streamId: String,
	/**
	 * ID of the user (or organization) who owns this stream.
	 */
	ownerId: String,
	/**
	 * ID of the user who requests access.
	 */
	requestorId: String,
	/**
	 * Creation date of this access request.
	 */
	created: Date,
	/**
	 * Last change date.
	 */
	changed: Date,
	/**
	 * Status of this stream access: REQUESTED, PERMITTED, or DENIED.
	 */
	status: { type: String, enum: [ "REQUESTED", "PERMITTED", "DENIED" ] }
}

var StreamAccessSchema = new Schema(template);
StreamAccessSchema.set('toJSON', { virtuals: true });
StreamAccessSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('StreamAccess', StreamAccessSchema);
