// middlewares/error.middleware.js
const logger = require('../utils/logger.util');

// Custom error handler
const errorHandler = (err, req, res, next) => {
	// Log error
	logger.error({
		message: err.message,
		stack: err.stack,
		path: req.path,
		method: req.method,
		timestamp: new Date().toISOString(),
	});

	// Handle specific error types
	if (err.name === 'ValidationError') {
		return res.status(400).json({
			success: false,
			message: 'Validation error',
			errors: err.details,
		});
	}

	if (err.name === 'UnauthorizedError') {
		return res.status(401).json({
			success: false,
			message: 'Unauthorized access',
		});
	}

	if (err.name === 'ForbiddenError') {
		return res.status(403).json({
			success: false,
			message: 'Forbidden access',
		});
	}

	if (err.name === 'NotFoundError') {
		return res.status(404).json({
			success: false,
			message: 'Resource not found',
		});
	}

	// Database errors
	if (err.code === 'ER_DUP_ENTRY') {
		return res.status(409).json({
			success: false,
			message: 'Duplicate entry found',
		});
	}

	// Handle multer errors
	if (err instanceof MulterError) {
		return res.status(400).json({
			success: false,
			message: err.message,
		});
	}

	// Default error
	return res.status(500).json({
		success: false,
		message:
			process.env.NODE_ENV === 'production'
				? 'Internal server error'
				: err.message,
	});
};

// Not found handler
const notFoundHandler = (req, res) => {
	res.status(404).json({
		success: false,
		message: 'Resource not found',
	});
};

// Rate limiter middleware
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // limit each IP to 100 requests per windowMs
	message: {
		success: false,
		message: 'Too many requests, please try again later',
	},
});

// Request logger middleware
const requestLogger = (req, res, next) => {
	logger.info({
		method: req.method,
		path: req.path,
		ip: req.ip,
		timestamp: new Date().toISOString(),
	});
	next();
};

module.exports = {
	errorHandler,
	notFoundHandler,
	apiLimiter,
	requestLogger,
};
