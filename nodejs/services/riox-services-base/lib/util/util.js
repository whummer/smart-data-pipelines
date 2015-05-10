var uuid = require('node-uuid');

module.exports.genShortUUID = global.genShortUUID = function() {
    var id = uuid.v4()
    /* trim to the last 12 chars */
    id = id.substring(id.length - 12);
    return id;
};

//
// custom API errors
//
/*
module.exports.NotFoundError = function (message, cause) {
	this.statusCode = 404;
	this.message = (message || "");
	this.cause = (cause || "");
};

module.exports.NotFoundError.prototype = Error.prototype;

module.exports.InternalError = function (message, cause) {
	this.statusCode = 500;
	this.message = (message || "");
	this.cause = (cause || "");
	Error.captureStackTrace(this, this.constructor);
};

module.exports.InternalError.prototype = Error.prototype;

module.exports.UnprocessableEntity = function (message, cause) {
	this.statusCode = 422;
	this.message = (message || "");
	this.cause = (cause || "");
};

module.exports.UnprocessableEntity.prototype = Error.prototype;
*/
/*
module.exports.NotFoundError = Error.extend('NotFoundError', 404);
module.exports.InternalError = Error.extend('InternalError', 500);
module.exports.UnprocessableEntity = Error.extend('UnprocessableEntity', 422);
*/

