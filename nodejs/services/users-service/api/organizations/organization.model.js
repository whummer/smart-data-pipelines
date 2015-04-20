'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var authTypes = ['github', 'twitter', 'facebook', 'google'];

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
