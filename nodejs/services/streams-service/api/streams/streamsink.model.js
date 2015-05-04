'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var template = {

	"_id": { type: String, default: genShortUUID},
	/**
	 * Name of this stream sink.
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
	 * ID of the organization under which this sink is consumed.
	 */
	"organization-id": String,
	/**
	 * Sink description.
	 */
	"description": String,
	/**
	 * Connector configuration, e.g., websocket, jms, ....
	 */
	"connector": {
		"type": { type: String } // websocket, jms, amqp
	}

};

var StreamSink = new Schema(template);
StreamSink.set('toJSON', { virtuals: true });
StreamSink.set('toObject', { virtuals: true });

module.exports = mongoose.model('StreamSink', StreamSink);
