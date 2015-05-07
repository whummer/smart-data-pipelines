'use strict';

var mongoose = global.mongoose || require('mongoose');
var Schema = mongoose.Schema;

var template = {};

template["_id"] = { type: String, default: genShortUUID};

/**
 * ID of the organization this membership belongs to.
 */
template[ORGANIZATION_ID] = String;
/**
 * Member identifier (either User ID or email address).
 */
template[MEMBER] = String;
/**
 * Status
 */
template[STATUS] = {type: String, 
	enum: [ 
		STATUS_PENDING, STATUS_CONFIRMED, STATUS_REJECTED, STATUS_UNKNOWN
	]
},
/**
 * Creator, i.e., user who invited the member.
 */
template[CREATOR_ID] = String;
/**
 * Creation Date.
 */
template[CREATION_DATE] = String;


var MembershipSchema = new Schema(template);

MembershipSchema.set('toJSON', { virtuals: true });
MembershipSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Membership', MembershipSchema);
