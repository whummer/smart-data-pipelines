'use strict';

var Schema = mongoose.Schema;

var pipeSchema = {};
pipeSchema['_id'] = {type: String, default: genShortUUID};
pipeSchema[NAME] = String;
pipeSchema[CREATOR_ID] = String;
pipeSchema[CREATION_DATE] = {type: Date, default: Date.now};
pipeSchema[DESCRIPTION] = String;

var pipeElSchema = {};
pipeSchema[PIPE_ELEMENTS] = [pipeElSchema];
pipeElSchema['_id'] = false;
pipeElSchema[ID] = {type: String, default: genShortUUID};
pipeElSchema[CATEGORY] = String;
pipeElSchema[TYPE] = {type: String};
pipeElSchema[PARAMS] = Schema.Types.Mixed;
pipeElSchema[EDGES_OUT] = [String];
pipeElSchema[POSITION] = {
		x: Number,
		y: Number,
		z: Number
};


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
