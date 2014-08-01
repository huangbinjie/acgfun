var winston = require('winston');
var settings = require('../config/settings');
module.exports = function(){
	var logger = new (winston.Logger)({
		transports: [
		new (winston.transports.Console)({ json: false, timestamp: true }),
		new winston.transports.File({ filename: settings.path+'logs/logs.log' })
		],
		exceptionHandlers: [
		new (winston.transports.Console)({ json: false, timestamp: true }),
		new winston.transports.File({ filename: settings.path+'logs/exceptions.log' })
		],
		exitOnError: false
	});
	return logger;
}