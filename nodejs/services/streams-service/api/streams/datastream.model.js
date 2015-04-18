'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var template = {

	"id": String,
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
		type : String
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
DataStreamSchema.plugin(mongooseAutoIncrement.plugin, { model: 'DataStream', field: 'id' });

module.exports = mongoose.model('DataStream', DataStreamSchema);
