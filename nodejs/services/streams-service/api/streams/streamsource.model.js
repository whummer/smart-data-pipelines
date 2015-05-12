'use strict';

var mongoose = global.mongoose || require('mongoose');
var Schema = mongoose.Schema;


var template = {}

template["_id"] = { type: String, default: genShortUUID},
/**
 * Name.
 */
template[NAME] = String;
/**
 * Creator.
 */
template[CREATOR_ID] = String;
/**
 * Creation Date.
 */
template[CREATION_DATE] = String;
/**
 * Description.
 */
template[DESCRIPTION] = String;
/**
 * Creator/Organization.
 */
template[ORGANIZATION_ID] = String;
/**
 * Stream Source Type.
 */
template[TYPE] = String;
/**
 * Pricing Model.
 */
template[PRICING] = {
	"billingUnit": String,
	"unitSize": Number,
	"unitPrice": Number
};
/**
 * Permission type (e.g., auto, manual, negotiation)
 */
template[PERMIT_MODE] = {};
template[PERMIT_MODE][TYPE] = {type: String};
/**
 * Stream sink connector (http, amqp, ...).
 */
template[CONNECTOR] = {};
template[CONNECTOR][TYPE] = {type: String};
/**
 * Retention time, e.g. 3h, 2w, 1m, 1y
 */
template[RETENTION_TIME] = String;
/**
 * Security (TLS only, full)
 */
template[SECURITY] = String;
/**
 * List of tags (e.g., speed, temperature)
 */
template[TAGS] = [String];
/**
 * Data items in this stream source, including pricing.
 */
var dataItem = {};
template[DATA_ITEMS] = [dataItem];
dataItem["_id"] = dataItem[ID] = false;
dataItem[NAME] = String;
dataItem[PRICING] = String;
/**
 * Whether this stream is publicly visible, searchable, queryable.
 */
template[VISIBLE] = Boolean;


var StreamSource = new Schema(template);
StreamSource.set('toJSON', { virtuals: true });
StreamSource.set('toObject', { virtuals: true });

module.exports = mongoose.model('StreamSource', StreamSource);
