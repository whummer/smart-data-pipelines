'use strict';

var mongoose = global.mongoose || require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var crypto = require('riox-services-base/lib/util/util');

var STATUS_PENDING = "PENDING";
var STATUS_CONFIRMED = "CONFIRMED";
var STATUS_REJECTED = "REJECTED";
var STATUS_UNKNOWN = "UNKNOWN";

var MembershipSchema = new Schema({

	"_id": { type: String, default: genShortUUID},
	/**
	 * ID of the organization this membership belongs to.
	 */
	"organization-id": String,
	/**
	 * Member identifier (either User ID or email address).
	 */
	"member": String,
	/**
	 * Status
	 */
	"status": {type: String, enum: [
	       STATUS_PENDING, STATUS_CONFIRMED, STATUS_REJECTED, STATUS_UNKNOWN
	]},
	/**
	 * Creator, i.e., user who invited the member.
	 */
	"creator-id": String,
	/**
	 * Creation Date.
	 */
	"creation-date": Date
});

MembershipSchema.set('toJSON', { virtuals: true });
MembershipSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Membership', MembershipSchema);
/* expose constants */
module.exports.STATUS_PENDING = STATUS_PENDING;
module.exports.STATUS_CONFIRMED = STATUS_CONFIRMED;
module.exports.STATUS_REJECTED = STATUS_REJECTED;
module.exports.STATUS_UNKNOWN = STATUS_UNKNOWN;
