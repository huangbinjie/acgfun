var winston = require('winston');
var settings = require('../config/settings');

var logger = new (winston.Logger)({
		transports: [
		new (winston.transports.Console)({}),
		new winston.transports.File({ filename: settings.path+'logs/logs.log' })
		],
		exceptionHandlers: [
		new (winston.transports.Console)({ level: 'error' }),
		new winston.transports.File({ filename: settings.path+'logs/exceptions.log' })
		],
		exitOnError: false
	});

module.exports = logger;