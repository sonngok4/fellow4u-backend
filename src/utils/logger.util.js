// utils/logger.util.js
const winston = require('winston');
const config = require('../configs/environment');

const logger = winston.createLogger({
	level: config.env === 'development' ? 'debug' : 'info',
	format: winston.format.combine(
		winston.format.timestamp({
			format: 'YYYY-MM-DD HH:mm:ss',
		}),
		winston.format.errors({ stack: true }),
		winston.format.splat(),
		winston.format.json(),
	),
	defaultMeta: { service: 'fellow4u-backend' },
	transports: [
		// Write all logs to console
		new winston.transports.Console({
			format: winston.format.combine(
				winston.format.colorize(),
				winston.format.simple(),
			),
		}),
		// Write all error logs to error.log
		new winston.transports.File({
			filename: 'logs/error.log',
			level: 'error',
		}),
		// Write all logs to combined.log
		new winston.transports.File({
			filename: 'logs/combined.log',
		}),
	],
});

// Create a stream object for Morgan
logger.stream = {
	write: message => {
		logger.info(message.trim());
	},
};

class Logger {
	static info(message, meta = {}) {
		logger.info(message, meta);
	}

	static error(message, meta = {}) {
		logger.error(message, meta);
	}

	static warn(message, meta = {}) {
		logger.warn(message, meta);
	}

	static debug(message, meta = {}) {
		logger.debug(message, meta);
	}

	static http(message, meta = {}) {
		logger.http(message, meta);
	}
}

module.exports = Logger;
