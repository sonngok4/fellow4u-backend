// controllers/booking.controller.js
const Booking = require('../models/booking.model');

class BookingController {
	static async createBooking(req, res, next) {
		try {
			const userId = req.user.id;
			const { tour_id, start_date, end_date, number_of_people } = req.body;

			// Get tour details to calculate price
			const tour = await Tour.findById(tour_id);
			if (!tour) {
				throw new ApiError(404, 'Tour not found');
			}

			// Calculate total price
			const total_price = tour.price_per_person * number_of_people;

			const bookingId = await Booking.create({
				user_id: userId,
				tour_id,
				start_date,
				end_date,
				number_of_people,
				total_price,
			});

			const booking = await Booking.findById(bookingId);

			res.status(201).json({
				status: 'success',
				data: { booking },
			});
		} catch (error) {
			next(error);
		}
	}

	static async getAllBookings(req, res, next) {
		try {
			const bookings = await Booking.findAll();
			res.json({
				status: 'success',
				data: { bookings },
			});
		} catch (error) {
			next(error);
		}
	}

	static async getBookingById(req, res, next) {
		try {
			const { id } = req.params;
			const booking = await Booking.findById(id);
			if (!booking) {
				throw new ApiError(404, 'Booking not found');
			}
			res.json({
				status: 'success',
				data: { booking },
			});
		} catch (error) {
			next(error);
		}
	}

	static async getGuideBookings(req, res, next) {
		try {
			const { id } = req.params;
			const bookings = await Booking.findByGuideId(id);
			res.json({
				status: 'success',
				data: { bookings },
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

	static async updateBookingStatus(req, res, next) {
		try {
			const { id } = req.params;
			const { status } = req.body;

			const booking = await Booking.findById(id);
			if (!booking) {
				throw new ApiError(404, 'Booking not found');
			}

			// Check if user has permission
			if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
				throw new ApiError(403, 'Not authorized');
			}

			const updated = await Booking.updateStatus(id, status);
			const updatedBooking = await Booking.findById(id);

			res.json({
				status: 'success',
				data: { booking: updatedBooking },
			});
		} catch (error) {
			next(error);
		}
	}

	// Process payment
	static async processPayment(req, res, next) {
		try {
			const { id } = req.params;
			const { payment_status } = req.body;

			const booking = await Booking.findById(id);
			if (!booking) {
				throw new ApiError(404, 'Booking not found');
			}

			// Check if user has permission
			if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
				throw new ApiError(403, 'Not authorized');
			}

			const updated = await Booking.updatePaymentStatus(id, payment_status);
			const updatedBooking = await Booking.findById(id);

			res.json({
				status: 'success',
				data: { booking: updatedBooking },
			});
		} catch (error) {
			next(error);
		}
	}

	static async getPaymentStatus(req, res, next) {
		try {
			const { id } = req.params;
			const booking = await Booking.findById(id);
			if (!booking) {
				throw new ApiError(404, 'Booking not found');
			}

			// Check if user has permission
			if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
				throw new ApiError(403, 'Not authorized');
			}

			res.json({
				status: 'success',
				data: { payment_status: booking.payment_status },
			});
		} catch (error) {
			next(error);
		}
	}
	// cancel booking
	static async cancelBooking(req, res, next) {
		try {
			const { id } = req.params;
			const booking = await Booking.findById(id);
			if (!booking) {
				throw new ApiError(404, 'Booking not found');
			}

			// Check if user has permission
			if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
				throw new ApiError(403, 'Not authorized');
			}

			const cancelled = await Booking.cancel(id);
			const cancelledBooking = await Booking.findById(id);

			res.json({
				status: 'success',
				data: { booking: cancelledBooking },
			});
		} catch (error) {
			next(error);
		}
	}
}

module.exports = BookingController;
