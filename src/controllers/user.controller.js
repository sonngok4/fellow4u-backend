const User = require("../models/user.model");

// controllers/user.controller.js
class UserController {
	static async getProfile(req, res, next) {
		try {
			const user = await User.findById(req.user.id);
			if (!user) {
				throw new ApiError(404, 'User not found');
			}

			delete user.password;
			res.json({
				status: 'success',
				data: { user },
			});
		} catch (error) {
			next(error);
		}
	}

	static async updateProfile(req, res, next) {
		try {
			const { full_name, phone_number } = req.body;
			const updated = await User.update(req.user.id, {
				full_name,
				phone_number,
			});

			if (!updated) {
				throw new ApiError(404, 'User not found');
			}

			const user = await User.findById(req.user.id);
			delete user.password;

			res.json({
				status: 'success',
				data: { user },
			});
		} catch (error) {
			next(error);
		}
    }
    
    static async changePassword(req, res, next) {
        try {
            const { old_password, new_password } = req.body;
            const user = await User.findById(req.user.id);
            if (!user) {
                throw new ApiError(404, 'User not found');
            }
            const isPasswordValid = await bcrypt.compare(old_password, user.password);
            if (!isPasswordValid) {
                throw new ApiError(400, 'Old password is incorrect');
            }
            const hashedPassword = await bcrypt.hash(new_password, 10);
            await User.updatePassword(req.user.id, hashedPassword);
            res.json({
                status: 'success',
                message: 'Password successfully changed',
            });
        } catch (error) {
            next(error);
        }
    }

    static async deleteAccount(req, res, next) {
        try {
            await User.remove(req.user.id);
            res.json({
                status: 'success',
                message: 'Account deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    static async getAllUsers(req, res, next) {
        try {
            const users = await User.findAll();
            res.json({
                status: 'success',
                data: { users },
            });
        } catch (error) {
            next(error);
        }
    }

    static async getUserBookings(req, res, next) {
        try {
            const userId = req.user.id;
            const bookings = await Booking.findByUserId(userId);
            res.json({
                status: 'success',
                data: { bookings },
            });
        } catch (error) {
            next(error);
        }
    }

    static async getUserReviews(req, res, next) {
        try {
            const userId = req.user.id;
            const reviews = await Review.findByUserId(userId);
            res.json({
                status: 'success',
                data: { reviews },
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = UserController;
