var winston = require('winston');

var logger = new winston.Logger({
	transports: [
		new (winston.transports.Console)({ level : 'info' })
	]
});

logger.cli();

module.exports=logger;
