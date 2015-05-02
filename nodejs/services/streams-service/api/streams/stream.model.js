'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var template = {

	"_id": { type: String, default: genShortUUID},
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
	"creation-date": Date,
	/**
	 * Description.
	 */
	"description": String,

	/**
	 * Source of this stream.
	 */
	"source-id": String,
	/**
	 * List of IDs of StreamProcessors of this stream.
	 */
	"processors": [ String ],
	/**
	 * Sink of this stream.
	 */
	"sink-id": String
};

var Stream = new Schema(template);
Stream.set('toJSON', { virtuals: true });
Stream.set('toObject', { virtuals: true });

module.exports = mongoose.model('Stream', Stream);
