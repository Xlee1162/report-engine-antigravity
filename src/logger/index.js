const winston = require('winston');
const path = require('path');
const fs = require('fs-extra');

// Ensure log directory exists
const logDir = 'logs';
fs.ensureDirSync(logDir);

const logger = winston.createLogger({
	level: 'info',
	format: winston.format.combine(
		winston.format.timestamp(),
		winston.format.json()
	),
	defaultMeta: { service: 'report-engine' },
	transports: [
		new winston.transports.File({
			filename: path.join(logDir, 'error.log'),
			level: 'error',
		}),
		new winston.transports.File({
			filename: path.join(logDir, 'combined.log'),
		}),
	],
});

// If we're not in production, log to the `console` with the simple format
if (process.env.NODE_ENV !== 'production') {
	logger.add(
		new winston.transports.Console({
			format: winston.format.combine(
				winston.format.colorize(),
				winston.format.simple()
			),
		})
	);
}

module.exports = logger;
