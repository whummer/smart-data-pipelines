'use strict';

var mongoose = global.mongoose || require('mongoose');
var Schema = mongoose.Schema;


var template = {}

template["_id"] = { type: String, default: genShortUUID},
/**
 * Unique name, used as subdomain name.
 */
template[DOMAIN_NAME] = String;
/**
 * Name.
 */
template[NAME] = String;
/**
 * Creator.
 */
template[CREATOR_ID] = String;
/**
 * Creation Date.
 */
template[CREATION_DATE] = String;
/**
 * Description.
 */
template[DESCRIPTION] = String;
/**
 * Creator/Organization.
 */
template[ORGANIZATION_ID] = String;
/**
 * Type.
 */
template[TYPE] = String;
/**
 * Pricing Model.
 */
template[PRICING] = {
	"billingUnit": String,
	"unitSize": Number,
	"unitPrice": Number
};
/**
 * Permission type (e.g., auto, manual, negotiation)
 */
template[PERMIT_MODE] = {};
template[PERMIT_MODE][TYPE] = {type: String};
/**
 * Connector (http, amqp, ...).
 */
template[CONNECTOR] = {};
template[CONNECTOR][TYPE] = {type: String};
template[CONNECTOR][CERTIFICATE] = {type: String};

/**
 * Retention time, e.g. 3h, 2w, 1m, 1y
 */
template[RETENTION_TIME] = String;
/**
 * Security (TLS only, full)
 */
template[SECURITY] = String;
/**
 * List of tags (e.g., speed, temperature)
 */
template[TAGS] = [String];
/**
 * Allow CORS access.
 */
template[ALLOW_CORS] = Boolean;
/**
 * Enable public access. This is required, e.g., for public web documents etc.
 */
template[PUBLIC_ACCESS] = Boolean;

/**
 * operations: [
 * 	{
 * 		"name": "Get Temperature",
 * 		"http-method": "GET",
 * 		"url-path": "/temperature",
 * 		"schema-in": "abc123",
 * 		"schema-out": "def456"
 * 	}]
 */
var operation = {};
operation["_id"] = { type: String, default: genShortUUID };
operation[NAME] = String;
operation[HTTP_METHOD] = { type: String, enum: ["GET", "PUT", "POST", "DELETE", "HEAD"] };
operation[URL_PATH] = String;
operation[MAPPED_PATH] = String;
operation[OPTIONS] = Schema.Types.Mixed; // generic options to describe this operation
operation[PRICING] = String;
operation[DISABLE_LOG] = Boolean; // disable access logs, e.g., for web documents which are requested very often
operation[SCHEMA_IN] = String;
operation[SCHEMA_OUT] = String;
var OperationSchema = new Schema(operation);
OperationSchema.virtual('id').get(function() {
    return this._id;
});
template[OPERATIONS] = [OperationSchema];

/**
 * Backend endpoints.
 */
template[BACKEND_ENDPOINTS] = [String];


var ProxySchema = new Schema(template);

ProxySchema.set('toJSON', { virtuals: true });
ProxySchema.set('toObject', { virtuals: true });
OperationSchema.set('toJSON', { virtuals: true });
OperationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Proxy', ProxySchema);
