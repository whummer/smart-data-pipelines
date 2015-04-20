'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var template = {

	"_id": { type: String, default: genShortUUID},
	/**
	 * Name.
	 */
	"name": String,
	/**
	 * Creator.
	 */
	"creator-id": String,
	/**
	 * Creation Date.
	 */
	"creation-date": Date,
	/**
	 * Creator/Organization.
	 */
	"organization-id": String,
	/**
	 * Description.
	 */
	"description": String,
	/**
	 * Stream Type.
	 */
	"type": String,
	/**
	 * Pricing Model.
	 */
	"pricing": {
		"billingUnit": String,
		"unitSize": Number,
		"unitPrice": Number
	},
	/**
	 * Permission type (e.g., auto, manual, negotiation)
	 */
	permit : {
		type : {type: String}
	},
	/**
	 * Stream sink config.
	 */
	"sink-id": String,
	/**
	 * Whether this stream is publicly visible, searchable, queryable.
	 */
	"visible": Boolean
}

var DataStreamSchema = new Schema(template);
DataStreamSchema.set('toJSON', { virtuals: true });
DataStreamSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('DataStream', DataStreamSchema);
