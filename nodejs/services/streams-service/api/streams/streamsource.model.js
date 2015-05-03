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
	"permit" : {
		type : {type: String}
	},
	/**
	 * Stream sink config.
	 */
	"sink-config": {
		"connector" : String // http, amqp, whatever
	},

	// e.g. 3h, 2w, 1m, 1y
	"retention-time" : String,

	// TLS only, full
	"security" : String,

	// tags (e.g., speed, temperature)
	"tags" : [String],

	"spring-xd-config" : {
		"stream-definition" : String
	},

	"data-items" : [{name: String, price: String, _id: false}],

	/**
	 * Whether this stream is publicly visible, searchable, queryable.
	 */
	"visible": Boolean
};

var StreamSource = new Schema(template);
StreamSource.set('toJSON', { virtuals: true });
StreamSource.set('toObject', { virtuals: true });

module.exports = mongoose.model('StreamSource', StreamSource);
