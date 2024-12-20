// controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const env = require('../configs/environment');
const { ApiError } = require('../utils/api-error');
const Agency = require('../models/agency.model');
const Guide = require('../models/guide.model');

class AuthController {
	static async register(req, res, next) {
		try {
			const { email, password, full_name, phone_number, role } = req.body;

			// More explicit check for existing user
			const existingUser = await User.findByEmail(email);
			console.log("Existing user:", existingUser);
			console.log("Existing user type:", typeof existingUser);
			console.log("Existing user length:", Array.isArray(existingUser) ? existingUser.length : 'not an array');

			// Modify the existence check
			if (existingUser && (Array.isArray(existingUser) ? existingUser.length > 0 : existingUser)) {
				console.error('User already exists:', email);
				throw new ApiError(400, 'Email already registered');
			}

			// Hash password
			const hashedPassword = await bcrypt.hash(password, 12);

			// Create user
			const userId = await User.create({
				email,
				password: hashedPassword,
				full_name,
				phone_number,
				role: role || 'user',
			});

			console.log("User ID:", userId);


			const user = await User.findById(userId);

			console.log("user", user);

			// Generate token
			const token = jwt.sign(
				{ id: user.id, email: user.email, role: user.role },
				env.JWT_SECRET,
				{ expiresIn: env.JWT_EXPIRES_IN },
			);

			// Remove password from response
			delete user.password;

			res.status(201).json({
				success: true,
				data: {
					user: {
						id: user.id,
						email: user.email,
						full_name: user.full_name,
						phone_number: user.phone_number,
						role: user.role,
					},
					token,
				},
			});
		} catch (error) {
			if (error.code === 'ER_DUP_ENTRY') {
				console.error('Email already registered:', error);
				next(new ApiError(400, 'Email already registered'));
			} else {
				console.error('Error registering user:', error);
				next(error);
			}
		}
	}

	static async forgotPassword(req, res, next) {
		try {
			const { email } = req.body;

			// Find user
			const user = await User.findByEmail(email);
			if (!user) {
				throw new ApiError(404, 'User not found');
			}

			// Generate token
			const token = jwt.sign({ id: user.id }, env.JWT_SECRET, {
				expiresIn: env.JWT_RESET_PASSWORD_EXPIRES_IN,
			});

			// Send email
			// ...

			res.json({
				status: 'success',
				message: 'Password reset link sent to email',
				data: { token },
			});
		} catch (error) {
			next(error);
		}
	}

	static async getMe(req, res, next) {
		try {
			res.json({
				status: 'success',
				data: {
					user: req.user,
				},
			});
		} catch (error) {
			next(error);
		}
	}
	static async login(req, res, next) {
		try {
			const { email, password } = req.body

			// Validate input
			if (!email || !password) {
				throw new ApiError(400, 'Email and password are required');
			}

			console.log('Login attempt:', {
				email,
				passwordProvided: !!password, // log whether password exists
				passwordLength: password ? password.length : 'N/A'
			});

			// Find user
			const user = await User.findByEmail(email);
			if (!user) {
				throw new ApiError(401, 'Invalid credentials');
			}

			// Additional validation
			if (!user.password) {
				console.error('User found but no password stored');
				throw new ApiError(401, 'Account authentication error');
			}

			// Check password
			const isPasswordValid = await bcrypt.compare(password, user.password);
			if (!isPasswordValid) {
				throw new ApiError(401, 'Invalid credentials');
			}

			// Lấy agency_id nếu user là agency
			let agency_id = null;
			if (user.role === 'agency') {
				const agency = await Agency.findByUserId(user.id);  // Lấy thông tin agency từ bảng agencies	
				if (agency) {
					agency_id = agency.id; // Lưu agency_id vào biến nếu user có agency
				}
			}

			// Lấy guides_id nếu user là guide
			let guide_id = null;
			if (user.role === 'guide') {
				const guide = await Guide.findByUserId(user.id);  // Lấy thông tin guide từ bảng guides
				if (guide) {
					guide_id = guide.id; // Lưu guides_id vào biến nếu user có guide
				}
			}

			// Generate token
			const token = jwt.sign(
				{ id: user.id, email: user.email, role: user.role, agency_id, guide_id },
				env.JWT_SECRET,
				{ expiresIn: env.JWT_EXPIRES_IN },
			);

			// Remove password from response
			delete user.password;

			res.json({
				status: 'success',
				data: { user, token },
			});
		} catch (error) {
			next(error);
		}
	}

	static async logout(req, res, next) {
		try {
			// Since JWT is stateless, we can't invalidate the token on the server side
			// The client should remove the token from storage
			res.json({
				status: 'success',
				message: 'Successfully logged out',
			});
		} catch (error) {
			next(error);
		}
	}

	static async refreshToken(req, res, next) {
		try {
			const { refreshToken } = req.body;

			if (!refreshToken) {
				throw new ApiError(400, 'Refresh token is required');
			}

			// Verify refresh token
			const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);

			// Find user
			const user = await User.findById(decoded.id);
			if (!user) {
				throw new ApiError(401, 'Invalid refresh token');
			}

			// Generate new access token
			const newAccessToken = jwt.sign(
				{ id: user.id, email: user.email, role: user.role },
				env.JWT_SECRET,
				{ expiresIn: env.JWT_EXPIRES_IN },
			);

			res.json({
				status: 'success',
				data: { token: newAccessToken },
			});
		} catch (error) {
			next(error);
		}
	}

	static async forgotPassword(req, res, next) {
		try {
			const { email } = req.body;

			// Find user
			const user = await User.findByEmail(email);
			if (!user) {
				throw new ApiError(404, 'User not found');
			}

			// Generate password reset token
			const resetToken = jwt.sign({ id: user.id }, env.JWT_SECRET, {
				expiresIn: '1h',
			});

			// Save reset token to user (you'll need to add this field to your user model)
			await User.updateResetToken(user.id, resetToken);

			// TODO: Send reset password email
			// This should be implemented using your email service

			res.json({
				status: 'success',
				message: 'Password reset instructions sent to email',
			});
		} catch (error) {
			next(error);
		}
	}

	static async resetPassword(req, res, next) {
		try {
			const { token, newPassword } = req.body;

			// Verify reset token
			const decoded = jwt.verify(token, env.JWT_SECRET);

			// Find user
			const user = await User.findById(decoded.id);
			if (!user) {
				throw new ApiError(400, 'Invalid or expired reset token');
			}

			// Hash new password
			const hashedPassword = await bcrypt.hash(newPassword, 10);

			// Update password
			await User.updatePassword(user.id, hashedPassword);

			// Clear reset token
			await User.updateResetToken(user.id, null);

			res.json({
				status: 'success',
				message: 'Password successfully reset',
			});
		} catch (error) {
			next(error);
		}
	}

	static async verifyEmail(req, res, next) {
		try {
			const { token } = req.params;

			// Verify email verification token
			const decoded = jwt.verify(token, env.JWT_SECRET);

			// Find user
			const user = await User.findById(decoded.id);
			if (!user) {
				throw new ApiError(400, 'Invalid verification token');
			}

			// Update user's email verification status
			await User.verifyEmail(user.id);

			res.json({
				status: 'success',
				message: 'Email successfully verified',
			});
		} catch (error) {
			next(error);
		}
	}
}

module.exports = AuthController;
