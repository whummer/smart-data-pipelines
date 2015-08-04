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
 * Source ID - the id of the source element where the data is coming from. // TODO needed here?
 */
template[SOURCE_ID] = String;
/**
 * Type of this processor (e.g., geo_fence, average_func, ...).
 */
template[TYPE] = String;
/**
 * Processor payload (input and output definitions).
 */
template[PAYLOAD] = {};
/**
 * Input payload values.
 */
var inputItem = {};
template[PAYLOAD][INPUT] = [inputItem];
inputItem["_id"] = inputItem[ID] = false;
inputItem[KEY] = String;
inputItem[VALUE] = String;
/**
 * Output payload values.
 */
var outputItem = {};
template[PAYLOAD][OUTPUT] = [outputItem];
outputItem["_id"] = outputItem[ID] = false;
outputItem[KEY] = String;
outputItem[VALUE] = String;

/* export schema */

var PipeProcessor = new Schema(template);
PipeProcessor.set('toJSON', { virtuals: true });
PipeProcessor.set('toObject', { virtuals: true });

module.exports = mongoose.model('PipeProcessor', PipeProcessor);
