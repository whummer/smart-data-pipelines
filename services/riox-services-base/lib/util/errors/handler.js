var log = global.log || require('winston');
var errors = require('./index');
var util = require('util');

module.exports = function (err, req, res, next) {
	if (!err) {
		return next();
	}

	var status = err.status || err.code || res.statusCode;

	if (!status) {
		log.info("No HTTP status available this is an error. Setting status to HTTP 500");
		status = 500;
	} else {
		log.debug("Handling error " + status + " for request:", req.path);
	}

	res.status(status).json({status: err.code, message: err.message, cause: err.cause});

	if(status != 401) {
		/* we don't want full stacktrace log output for every 401 error */
		next(err);
	}
};
