'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var template = {

	"_id": { type: String, default: genShortUUID},
	"name": String,
	"creator-id": String,
	"creation-date": Date,
	"organization-id": String,
	"description": String,
  "visible": Boolean,

  // Valid types: "websocket", "http", "jms", ...
  "type": String

  // TODO add other elements as needed - please discuss with othter team members

};

var StreamSink = new Schema(template);
StreamSink.set('toJSON', { virtuals: true });
StreamSink.set('toObject', { virtuals: true });

module.exports = mongoose.model('StreamSource', StreamSink);
