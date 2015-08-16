'use strict';

var Schema = mongoose.Schema;

var pipeSchema = {};
pipeSchema['_id'] = {type: String, default: genShortUUID};
pipeSchema[NAME] = String;
pipeSchema[CREATOR_ID] = String;
pipeSchema[CREATION_DATE] = {type: Date, default: Date.now};
pipeSchema[DESCRIPTION] = String;
pipeSchema[PIPE_ELEMENTS] = Schema.Types.Mixed;

var Pipe = new Schema(pipeSchema);

Pipe.set('toJSON', {virtuals: true});
Pipe.options.toJSON.transform = function (doc, ret, options) {
	// remove the _id an __v of every document before returning the result
	delete ret._id;
	delete ret.__v
}

Pipe.set('toObject', {virtuals: true});

module.exports.Model = mongoose.model('Pipe', Pipe);
module.exports.Schema = Pipe;
