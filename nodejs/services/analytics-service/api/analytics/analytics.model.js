'use strict';

var mongoose = global.mongoose || require('mongoose');
var Schema = mongoose.Schema;

var template = {};

template["_id"] = { type: String, default: genShortUUID };

/**
 * Name.
 */
template[NAME] = String;
/**
 * Description.
 */
template[DESCRIPTION] = String;
/**
 * Input parameters.
 */
var inputParam = {}
template[INPUT] = [inputParam];
inputParam["_id"] = false;
inputParam[ID] = false;
inputParam[KEY] = String;
inputParam[DESCRIPTION] = String;
inputParam[VALUE_TYPE] = String;
/**
 * Output parameters.
 */
var outputParam = {}
template[OUTPUT] = [outputParam];
outputParam["_id"] = false;
outputParam[ID] = false;
outputParam[KEY] = String;
outputParam[DESCRIPTION] = String;
outputParam[VALUE_TYPE] = String;


var AnalyticsFunctionSchema = new Schema(template);

AnalyticsFunctionSchema.set('toJSON', { virtuals: true });
AnalyticsFunctionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('AnalyticsFunction', AnalyticsFunctionSchema);
