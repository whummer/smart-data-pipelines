'use strict';

var Schema = mongoose.Schema;

const ENV_DEV = Symbol('Development');
const ENV_STAGING = Symbol('Staging');
const ENV_PROD = Symbol('Production');

var deploymentSchema = {};
deploymentSchema['_id'] = {type: String, default: genShortUUID};
deploymentSchema[NAME] = String;
deploymentSchema[CREATOR_ID] = String;
deploymentSchema[CREATION_DATE] = {type: Date, default: Date.now};
deploymentSchema[DESCRIPTION] = String;
deploymentSchema[PIPE_ID] = String;
deploymentSchema[ENVIRONMENT] = String;
deploymentSchema[STATUS] = Schema.Types.Mixed;

var PipeDeployment = new Schema(deploymentSchema);
PipeDeployment.set('toJSON', {virtuals: true});
PipeDeployment.set('toObject', {virtuals: true});

module.exports = mongoose.model('PipeDeployment', PipeDeployment);
module.exports = ENV_DEV;
