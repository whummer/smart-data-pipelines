'use strict';

var mongoose = global.mongoose || require('mongoose-q')();

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
Pipe.set('toObject', {virtuals: true});

module.exports = mongoose.model('Pipe', Pipe);