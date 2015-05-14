'use strict';
// from https://github.com/ianwremmel/extend-error/blob/master/index.js

var cloneDeep = require('lodash.clonedeep');
var forOwn = require('lodash.forown');
var identity = require('lodash.identity');
var util = require('util');


function extendError(BaseType, subTypeName, errorCode, options) {
	if (typeof BaseType !== 'function') {
		options = errorCode;
		errorCode = subTypeName;
		subTypeName = BaseType;
		BaseType = Error;
	}

	if (typeof subTypeName === 'object') {
		options = subTypeName;
		subTypeName = undefined;
		errorCode = undefined;
	}

	if (!this) {
		if (typeof BaseType !== 'function') {
			throw new Error('`BaseType` must be a Function');
		}

		return extendError.apply(BaseType, arguments);
	}

	subTypeName = subTypeName || options.subTypeName;
	if (!subTypeName) {
		throw new Error('`subTypeName` is required');
	}

	var properties = (options && options.properties) ? cloneDeep(options.properties) : {};

	if (errorCode) {
		properties.code = errorCode;
	}

	// Define the new type
	function SubType(message, cause) {
		// Handle constructor called without `new`
		if (!(this instanceof SubType)) {
			return new SubType(message, cause);
		}

		forOwn(properties, function (value, key) {
			this[key] = value;
		}, this);

		Object.defineProperties(this, {
			name: {
				enumerable: false,
				value: subTypeName
			},
			message: {
				enumerable: false,
				value: this.parseFn(message || '')
			},
			cause : {
				value : cause
			}
		});

		// Include stack trace in error object
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, this.constructor);
		}
		else {
			this.stack = Error().stack;
		}
	}

	// Inherit the base prototype chain
	util.inherits(SubType, this);

	SubType.prototype.parseFn = options && options.parseFn || BaseType.prototype.parseFn || identity;

	// Attach extend() to the SubType to make it further extendable (but only if
	// `extend()` has been monkeypatched onto the Error object).
	if (this.extend) {
		SubType.extend = this.extend;
	}

	return SubType;
}

/**
 * Add `extend()` method to {Error} type
 */
extendError.monkeypatch = function () {
	Error.extend = extendError;
};

module.exports = extendError;

// some common HTTP errors
module.exports.InternalError = extendError('InternalError', 500);
module.exports.UnauthorizedError = extendError('UnauthorizedError', 401);
module.exports.NotFoundError = extendError('NotFoundError', 404);
module.exports.UnprocessableEntity = extendError('NotFoundError', 422);
