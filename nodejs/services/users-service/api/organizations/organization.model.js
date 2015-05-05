'use strict';

var mongoose = global.mongoose || require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');

var OrganizationSchema = new Schema({

	"_id": { type: String, default: genShortUUID},
	/**
	 * Name.
	 */
	"name": String,
	/**
	 * Image(s).
	 */
	"image-data": [{
		"_id": false,
		"id": false,
		/**
		 * Image HREF.
		 */
		href: String
	}],
	/**
	 * Creator.
	 */
	"creator-id": String,
	/**
	 * Creation Date.
	 */
	"creation-date": Date
});

OrganizationSchema.set('toJSON', { virtuals: true });
OrganizationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Organization', OrganizationSchema);
