'use strict';

var mongoose = global.mongoose || require('mongoose');
var Schema = mongoose.Schema;

var template = {};

template["_id"] = { type: String, default: genShortUUID};

/**
 * ID of the organization or user this notification belongs to.
 */
template[RECIPIENT_ID] = String;
/**
 * Status
 */
template[STATUS] = {type: String, 
	enum: [ 
		STATUS_UNREAD, STATUS_READ, STATUS_DELETED
	]
},
/**
 * Creator, i.e., user or organization who is the originator of this notification.
 */
template[CREATOR_ID] = String;
/**
 * Creation Date.
 */
template[CREATION_DATE] = String;
/**
 * Notification type (e.g., TYPE_ACCESS_REQUEST).
 */
template[TYPE] = String;
/**
 * Notification text.
 */
template[TEXT] = String;
/**
 * Additional notification parameters.
 */
template[PARAMS] = Schema.Types.Mixed;


var NotificationSchema = new Schema(template);

NotificationSchema.set('toJSON', { virtuals: true });
NotificationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Notification', NotificationSchema);
