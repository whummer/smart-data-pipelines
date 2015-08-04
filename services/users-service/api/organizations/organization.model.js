'use strict';

var util = require('riox-services-base/lib/util/util');
var riox = require('riox-shared/lib/api/riox-api');
var mongoose = global.mongoose || require('mongoose');
var Schema = mongoose.Schema;

var template = {};
template["_id"] = { type: String, default: genShortUUID};

/**
 * Descriptive Name.
 */
template[NAME] = String;
/**
 * Unique name (used as domain name). List of strings.
 */
template[DOMAIN_NAME] = [ String ];
/**
 * Image(s).
 */
var imageEntry = {};
template[IMAGE_DATA] = [imageEntry]
imageEntry["_id"] = imageEntry[ID] = false;
imageEntry[HREF]= String;
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
