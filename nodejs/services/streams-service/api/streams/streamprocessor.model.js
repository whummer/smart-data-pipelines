'use strict';

var mongoose = global.mongoose || require('mongoose');
var Schema = mongoose.Schema;


var template = {}
template["_id"] = { type: String, default: genShortUUID};


/**
 * Name.
 */
template[NAME] = String;
/**
 * Creation date.
 */
template[CREATION_DATE] = Date;
/**
 * ID of the creating user.
 */
template[CREATOR_ID] = String;
/**
 * Id of the owning organization.
 */
template[ORGANIZATION_ID] = String;
/**
 * Description of this processor.
 */
template[DESCRIPTION] = String;
/**
 * Visibility.
 */
template[VISIBLE] = Boolean;
/**
 * Source ID - the id of the source element where the data is coming from.
 */
template[SOURCE_ID] = String;
/**
 * Processor payload (input and output definitions).
 */
template[PAYLOAD] = {};
/**
 * Input payload parameters/values.
 */
var inputItem = {};
template[PAYLOAD][INPUT] = [inputItem];
inputItem["_id"] = inputItem[ID] = false;
inputItem[KEY] = String;
inputItem[DESCRIPTION] = String;
inputItem[VALUE_TYPE] = String;
/**
 * Output payload parameters/values.
 */
var outputItem = {};
template[PAYLOAD][OUTPUT] = [outputItem];
outputItem["_id"] = outputItem[ID] = false;
outputItem[KEY] = String;
outputItem[DESCRIPTION] = String;
outputItem[VALUE_TYPE] = String;

/* export schema */

var StreamProcessor = new Schema(template);
StreamProcessor.set('toJSON', { virtuals: true });
StreamProcessor.set('toObject', { virtuals: true });

module.exports = mongoose.model('StreamProcessor', StreamProcessor);
