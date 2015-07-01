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
 * Stream Source Type.
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
 * Stream sink connector (http, amqp, ...).
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
 * Data schemas.
 * 
 * schemas: [
 * 	{
 * 		"name": "Location Stream",
 * 		"data-items": [
 * 			{
 * 				"name": "Current Location - Latitude",
 * 				"selector": "location.latitude",
 * 				"type": "DOUBLE"
 * 			},{
 * 				"name": "Current Location - Longitude",
 * 				"selector": "location.longitude",
 * 				"type": "DOUBLE"
 * 			}
 * 		]
 * 	}
 * ]
 */
var schema = {};
var dataItem = {};
schema["_id"] = { type: String, default: genShortUUID };
schema[NAME] = String;
schema[DATA_ITEMS] = [dataItem];
dataItem["_id"] = dataItem[ID] = false;
dataItem[SELECTOR] = String;
dataItem[PRICING] = Schema.Types.Mixed;
dataItem[NAME] = String;
dataItem[TYPE] = { type: String };
var SchemaSchema = new Schema(schema);
SchemaSchema.virtual('id').get(function() {
    return this._id;
});
template[SCHEMAS] = [SchemaSchema];

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
 * Whether this stream is publicly visible, searchable, queryable.
 */
template[VISIBLE] = Boolean;

/**
 * Backend endpoints.
 */
template[BACKEND_ENDPOINTS] = [String];


var StreamSource = new Schema(template);

StreamSource.set('toJSON', { virtuals: true });
StreamSource.set('toObject', { virtuals: true });
OperationSchema.set('toJSON', { virtuals: true });
OperationSchema.set('toObject', { virtuals: true });
SchemaSchema.set('toJSON', { virtuals: true });
SchemaSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('StreamSource', StreamSource);
