'use strict';

var mongoose = global.mongoose || require('mongoose');
var Schema = mongoose.Schema;

var template = {};
template["_id"] = { type: String, default: genShortUUID};

var CERT_FILE = "cert-file";
var PK_FILE = "pk-file";

/**
 * Descriptive Name.
 */
template[NAME] = String;
/**
 * Reference to certificate file (*.crt).
 */
template[CERT_FILE] = String;
/**
 * Reference to private key file (*.key).
 */
template[PK_FILE] = String;
/**
 * Creator.
 */
template[CREATOR_ID] = String;
/**
 * Creation Date.
 */
template[CREATION_DATE] = Date;

var CertificateSchema = new Schema(template);

CertificateSchema.set('toJSON', { virtuals: true });
CertificateSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Certificate', CertificateSchema);
