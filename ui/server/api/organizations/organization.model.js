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
	"creation-date": Date
}

var OrganizationSchema = new Schema(template);

module.exports = mongoose.model('Organization', OrganizationSchema);
