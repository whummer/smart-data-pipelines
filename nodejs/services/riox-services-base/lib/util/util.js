var uuid = require('node-uuid');

exports.genShortUUID = global.genShortUUID = function() {
    var id = uuid.v4()
    /* trim to the last 12 chars */
    id = id.substring(id.length - 12);
    return id;
};

//
// custom API errors
//
/*
exports.NotFoundError = function (message, cause) {
	this.statusCode = 404;
	this.message = (message || "");
	this.cause = (cause || "");
};

exports.NotFoundError.prototype = Error.prototype;

exports.InternalError = function (message, cause) {
	this.statusCode = 500;
	this.message = (message || "");
	this.cause = (cause || "");
	Error.captureStackTrace(this, this.constructor);
};

exports.InternalError.prototype = Error.prototype;

exports.UnprocessableEntity = function (message, cause) {
	this.statusCode = 422;
	this.message = (message || "");
	this.cause = (cause || "");
};

exports.UnprocessableEntity.prototype = Error.prototype;
*/
/*
exports.NotFoundError = Error.extend('NotFoundError', 404);
exports.InternalError = Error.extend('InternalError', 500);
exports.UnprocessableEntity = Error.extend('UnprocessableEntity', 422);
*/


/*
 * Based on
 * http://stackoverflow.com/questions/1248302/javascript-object-size
 */
exports.estimateObjectSize = function(object) {

    var objectList = [];

    var recurse = function(value) {
        var bytes = 0;

        if ( typeof value === 'boolean' ) {
            bytes = 4;
        }
        else if ( typeof value === 'string' ) {
            bytes = value.length * 2;
        }
        else if ( typeof value === 'number' ) {
            bytes = 8;
        }
        else if
        (
            typeof value === 'object'
            && objectList.indexOf( value ) === -1
        )
        {
            objectList[ objectList.length ] = value;

            for( i in value ) {
                bytes += 8; // an assumed existence overhead
                bytes += recurse( value[i] );
            }
        }

        return bytes;
    }

    return recurse( object );
}

