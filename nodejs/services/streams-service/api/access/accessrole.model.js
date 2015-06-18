'use strict';

var mongoose = global.mongoose || require('mongoose');
var Schema = mongoose.Schema;


var template = {
	"_id": { type: String, default: genShortUUID}
};

/**
 * Name of this role.
 */
template[NAME] = String;
/**
 * ID of the organization that created this role belongs to.
 */
template[ORGANIZATION_ID] = String;
/**
 * ID of the user who created this role.
 */
template[CREATOR_ID] = String;
/**
 * Creation date of this role.
 */
template[CREATION_DATE] = Date;


var AccessRoleSchema = new Schema(template);
AccessRoleSchema.set('toJSON', { virtuals: true });
AccessRoleSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('AccessRole', AccessRoleSchema);
