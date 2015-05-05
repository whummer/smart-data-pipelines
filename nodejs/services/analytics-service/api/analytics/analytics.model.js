'use strict';

var mongoose = global.mongoose || require('mongoose');
var Schema = mongoose.Schema;

var AnalyticsFunctionSchema = new Schema({

  "_id": { type: String, default: genShortUUID },

  "name": String,
  description: String,
  "input": [{
    _id: false,
    id: false,
    key: String,
    description: String,
    "value-type": String
  }],
  "output" : [{
    _id: false,
    id: false,
    key: String,
    description: String,
    "value-type": String
  }]
});

AnalyticsFunctionSchema.set('toJSON', { virtuals: true });
AnalyticsFunctionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('AnalyticsFunction', AnalyticsFunctionSchema);
