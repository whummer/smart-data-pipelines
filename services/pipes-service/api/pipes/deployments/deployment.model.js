'use strict';

var Schema = mongoose.Schema;

var deploymentSchema = {};
deploymentSchema['_id'] = {type: String, default: genShortUUID};
deploymentSchema[CREATOR_ID] = String;
deploymentSchema[CREATION_DATE] = {type: Date, default: Date.now};
deploymentSchema[PIPE_ID] = String;
deploymentSchema[PIPE_ENVIRONMENT] = String;
deploymentSchema[STATUS] = Schema.Types.Mixed;

var PipeDeployment = new Schema(deploymentSchema);
PipeDeployment.set('toJSON', {virtuals: true});
PipeDeployment.options.toJSON.transform = function (doc, ret, options) {
	// remove the _id an __v of every document before returning the result
	delete ret._id;
	delete ret.__v
}
PipeDeployment.set('toObject', {virtuals: true});

module.exports.Model = mongoose.model('PipeDeployment', PipeDeployment);
module.exports.Schema = PipeDeployment;
