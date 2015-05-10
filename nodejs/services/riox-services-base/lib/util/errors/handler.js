var log = global.log || require('winston');
var errors = require('./index');
var util = require('util');

module.exports = function (err, req, res, next) {
	if (!err || !err.code) {
		return next();
	}

	log.debug("Handling error " + err.code + " for request: ", req.path);
	res.json(err.code, {status: err.code, message: err.message, cause: err.cause});
};
