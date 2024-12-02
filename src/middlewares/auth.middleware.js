// middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');
const { verifyToken } = require('../utils/jwt.util');
const User = require('../models/user.model');
const Guide = require('../models/guide.model');
const Agency = require('../models/agency.model');


const authMiddleware = async (req, res, next) => {
	try {
		// Get token from header
		const authorization = req.headers.authorization;
		// console.log(authorization);
		if (!authorization || !authorization.startsWith('Bearer ')) {
			return res.status(401).json({
				success: false,
				message: 'No token provided',
			});
		}

		// Verify token
		const token = authorization.split(' ')[1];
		// console.log(token);
		const decoded = await verifyToken(token);
		console.log("DECODED: ",decoded);
		

		// Get user from database
		const user = await User.findById(decoded.id);
		if (!user) {
			return res.status(401).json({
				success: false,
				message: 'User not found',
			});
		}

		// Check if user is active
		if (user.status !== 'active') {
			return res.status(401).json({
				success: false,
				message: 'Account is not active',
			});
		}

		// Attach user to request
		req.user = user;
		next();
	} catch (error) {
		if (error.name === 'TokenExpiredError') {
			return res.status(401).json({
				success: false,
				message: 'Token expired',
			});
		}
		return res.status(401).json({
			success: false,
			message: 'Invalid token',
		});
	}
};

const guideMiddleware = async (req, res, next) => {
	try {
		// Check if user is authenticated
		if (!req.user) {
			return res.status(401).json({
				success: false,
				message: 'Authentication required',
			});
		}

		// Check if user is a guide
		const guide = await Guide.findByUserId(req.user.id);
		if (!guide) {
			return res.status(403).json({
				success: false,
				message: 'Guide access required',
			});
		}

		// Attach guide to request
		req.guide = guide;
		next();
	} catch (error) {
		next(error);
	}
};

const agencyMiddleware = async (req, res, next) => {
	try {
		// Check if user is authenticated
		if (!req.user) {
			return res.status(401).json({
				success: false,
				message: 'Authentication required',
			});
		}

		// Check if user represents an agency
		const agency = await Agency.findByUserId(req.user.id);
		if (!agency) {
			return res.status(403).json({
				success: false,
				message: 'Agency access required',
			});
		}

		// Attach agency to request
		req.agency = agency;
		next();
	} catch (error) {
		next(error);
	}
};

const roleMiddleware = (roles = []) => {
	return (req, res, next) => {
		if (!req.user) {
			return res.status(401).json({
				success: false,
				message: 'Authentication required',
			});
		}

		if (!roles.includes(req.user.role)) {
			return res.status(403).json({
				success: false,
				message: 'Insufficient permissions',
			});
		}

		next();
	};
};

module.exports = {
	authMiddleware,
	guideMiddleware,
	agencyMiddleware,
	roleMiddleware,
};
