'use strict';

var Schema = mongoose.Schema;

var deploymentSchema = {};
deploymentSchema['_id'] = {type: String, default: genShortUUID};
deploymentSchema[CREATOR_ID] = String;
deploymentSchema[CREATION_DATE] = {type: Date, default: Date.now};
deploymentSchema[PIPE_ID] = String;
deploymentSchema[PIPE_ENVIRONMENT] = String;
deploymentSchema[STATUS] = Schema.Types.Mixed;

var elementSchema = {};
elementSchema['_id'] = false;
elementSchema[ID] = String;
elementSchema[STATUS] = String;
elementSchema[DETAILS] = Schema.Types.Mixed;
var ElementSchema = new Schema(elementSchema);
deploymentSchema[PIPE_ELEMENTS] = [ElementSchema];
ElementSchema.set('toJSON', {virtuals: true});
ElementSchema.options.toJSON.transform = function (doc, ret, options) {
	delete ret._id;
	delete ret.__v;
}

var PipeDeployment = new Schema(deploymentSchema);
PipeDeployment.set('toJSON', {virtuals: true});
PipeDeployment.options.toJSON.transform = function (doc, ret, options) {
	// remove the _id an __v of every document before returning the result
	delete ret._id;
	delete ret.__v;
}
PipeDeployment.set('toObject', {virtuals: true});

module.exports.Model = mongoose.model('PipeDeployment', PipeDeployment);
module.exports.Schema = PipeDeployment;
