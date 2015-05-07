'use strict';

var mongoose = global.mongoose || require('mongoose');
var Schema = mongoose.Schema;

var template = {};
template["_id"] = { type: String, default: genShortUUID};

/**
 * Name.
 */
template[NAME] = String;
/**
 * Image(s).
 */
template[IMAGE_DATA] = [{
	"_id": false,
	"id": false,
	/**
	 * Image HREF.
	 */
	href: String
}];
/**
 * Creator.
 */
template[CREATOR_ID] = String;
/**
 * Creation Date.
 */
template[CREATION_DATE] = Date;

var OrganizationSchema = new Schema(template);

OrganizationSchema.set('toJSON', { virtuals: true });
OrganizationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Organization', OrganizationSchema);
