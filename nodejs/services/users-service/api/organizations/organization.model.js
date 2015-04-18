'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var authTypes = ['github', 'twitter', 'facebook', 'google'];

var OrganizationSchema = new Schema({
	name: String,
	"image-data": [{
		href: String
	}]
});

OrganizationSchema.plugin(mongooseAutoIncrement.plugin, 
		{ model: 'Organization', field: 'id' });

module.exports = mongoose.model('Organization', OrganizationSchema);
