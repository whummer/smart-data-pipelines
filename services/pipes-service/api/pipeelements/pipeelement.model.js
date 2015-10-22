'use strict';

var Schema = mongoose.Schema;

const ELEMENT_TYPES = ['container', 'source', 'sink', 'processor'];

var elementOptionSchema = {};
elementOptionSchema[NAME] = String;
elementOptionSchema[TYPE] = String;
elementOptionSchema[DESCRIPTION] = String;
elementOptionSchema[PIPE_ELEMENT_OPTION_DEFAULT] = String;


var PipeElementOptionSchema = new Schema(elementOptionSchema);

var pipeElementTypeValidator = function (type) {
	return ELEMENT_TYPES.includes(type);
};

var pipeElementSchema = {};
pipeElementSchema['_id'] = {type: String, default: genShortUUID};
pipeElementSchema[NAME] = String;
pipeElementSchema[CREATOR_ID] = String;
pipeElementSchema[CREATION_DATE] = {type: Date, default: Date.now};
pipeElementSchema[DESCRIPTION] = String;
pipeElementSchema[PIPE_ICON] = String;
pipeElementSchema[CATEGORY] = String;
pipeElementSchema[TYPE] = {type: String, validator: pipeElementTypeValidator};
pipeElementSchema[HTML] = String;
pipeElementSchema[OPTIONS] = [PipeElementOptionSchema];

var PipeElementSchema = new Schema(pipeElementSchema);
PipeElementSchema.set('toJSON', {virtuals: true});
PipeElementSchema.set('toObject', {virtuals: true});
PipeElementSchema.options.toJSON.transform = function (doc, ret) {
	delete ret._id;
	delete ret.__v;
};

module.exports.Model = mongoose.model('PipeElement', PipeElementSchema);
module.exports.Schema = PipeElementSchema;
