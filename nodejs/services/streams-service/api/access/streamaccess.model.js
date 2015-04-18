'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var template = {

		"_id": { type: String, default: genShortUUID},
		streamId: String,
		ownerId: String,
		requestorId: String,
		created: Date,
		changed: Date,
		status: {
			type: String
		}
}

var StreamAccessSchema = new Schema(template);
StreamAccessSchema.set('toJSON', { virtuals: true });
StreamAccessSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('StreamAccess', StreamAccessSchema);
