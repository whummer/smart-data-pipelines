'use strict';

var mongoose = global.mongoose || require('mongoose');
var Schema = mongoose.Schema;

var template = {};

template["_id"] = { type: String, default: genShortUUID};

/** Creation Date. */
template[CREATION_DATE] = Date;
/** Activation Date. */
template[ACTIVATION_DATE] = Date;
/** User id. */
template[USER_ID] = String;
/** activation key. */
template[ACTIVATION_KEY] = String;
/** activation key. */
template[DEACTIVATED] = Boolean;

var ActivationSchema = new Schema(template);

ActivationSchema.set('toJSON', { virtuals: true });
ActivationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Activation', ActivationSchema);
