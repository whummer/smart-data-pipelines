'use strict';

var Schema = mongoose.Schema;

var deploymentSchema = {};
deploymentSchema['_id'] = {type: String, default: genShortUUID};
deploymentSchema[NAME] = String;
deploymentSchema[CREATOR_ID] = String;
deploymentSchema[CREATION_DATE] = {type: Date, default: Date.now};
deploymentSchema[DESCRIPTION] = String;
deploymentSchema[PIPE_ID] = String;
deploymentSchema[PIPE_DEPLOYMENT_STATUS] = String;

var PipeDeployment = new Schema(deploymentSchema);
PipeDeployment.set('toJSON', {virtuals: true});
PipeDeployment.set('toObject', {virtuals: true});

module.exports = mongoose.model('PipeDeployment', PipeDeployment);
