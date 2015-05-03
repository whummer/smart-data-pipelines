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

  "source-id" : String, // the id of the source element where the data is coming from

  // Valid types: "analytics", ...
  "type": String,

  // TODO discuss this - it is kept generic because as of today we only really have analytics functions
  // as processing elements.

  "processor-id" : String,
  "processor-payload": {
      "input": [{
        _id: false,
        id: false,
        key: String,
        description: String,
        "value-type": String
      }],
      "output": [{
        _id: false,
        id: false,
        key: String,
        description: String,
        "value-type": String
      }]
  }
};

var StreamProcessor = new Schema(template);
StreamProcessor.set('toJSON', { virtuals: true });
StreamProcessor.set('toObject', { virtuals: true });

module.exports = mongoose.model('StreamSource', StreamProcessor);
