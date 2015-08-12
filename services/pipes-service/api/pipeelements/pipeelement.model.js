'use strict';

// var mongoose = global.mongoose || require('mongoose-q')();
// var mongoose = require('mongoose-q')(require('mongoose'));

var Schema = mongoose.Schema;

const ELEMENT_TYPES = ['container', 'source', 'sink', 'processor'];


var elementOptionSchema = {};
elementOptionSchema[NAME] = String;
elementOptionSchema[VALUE_TYPE] = String;
elementOptionSchema[DESCRIPTION] = String;
elementOptionSchema[PIPE_ELEMENT_OPTION_DEFAULT] = String;


var PipeElementOptionSchema = new Schema(elementOptionSchema);

var pipeElementTypeValidator = function (type) {
	return ELEMENT_TYPES.includes(type);
};

var pipeElementSchema = {};
pipeElementSchema['_id'] = {type: String, default: genShortUUID};
pipeElementSchema[CREATOR_ID] = String;
pipeElementSchema[CREATION_DATE] = {type: Date, default: Date.now};
pipeElementSchema[DESCRIPTION] = String;
pipeElementSchema[PIPE_ICON] = String;
pipeElementSchema[TYPE] = {type: String, validator: pipeElementTypeValidator};
pipeElementSchema[PIPE_ELEMENT_SUBTYPE] = String;
pipeElementSchema[PIPE_ELEMENT_OPTIONS] = [PipeElementOptionSchema];

var PipeElementSchema = new Schema(pipeElementSchema);
PipeElementSchema.set('toJSON', {virtuals: true});
PipeElementSchema.set('toObject', {virtuals: true});

module.exports.Model = mongoose.model('PipeElement', PipeElementSchema);
module.exports.Schema = PipeElementSchema;
