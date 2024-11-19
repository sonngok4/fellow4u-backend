// controllers/review.controller.js
const Review = require('../models/review.model');
const Booking = require('../models/booking.model');

class ReviewController {
	static async createReview(req, res, next) {
		try {
			const {
				booking_id,
				rating,
				service_rating,
				guide_rating,
				value_rating,
				comment,
			} = req.body;

			// Verify booking exists and belongs to user
			const booking = await Booking.findById(booking_id);
			if (!booking) {
				throw new ApiError(404, 'Booking not found');
			}

			if (booking.user_id !== req.user.id) {
				throw new ApiError(403, 'Not authorized');
			}

			// Check if review already exists
			const existingReview = await Review.findByBookingId(booking_id);
			if (existingReview) {
				throw new ApiError(400, 'Review already exists for this booking');
			}

			const reviewId = await Review.create({
				booking_id,
				rating,
				service_rating,
				guide_rating,
				value_rating,
				comment,
			});

			const review = await Review.findById(reviewId);

			res.status(201).json({
				status: 'success',
				data: { review },
			});
		} catch (error) {
			next(error);
		}
	}

	static async createReviewForTour(req, res, next) {
		try {
			const { tour_id } = req.params;
			const {
				rating,
				service_rating,
				guide_rating,
				value_rating,
				comment,
			} = req.body;

			const reviewId = await Review.create({
				booking_id: tour_id,
				rating,
				service_rating,
				guide_rating,
				value_rating,
				comment,
			});

			const review = await Review.findById(reviewId);

			res.status(201).json({
				status: 'success',
				data: { review },
			});
		} catch (error) {
			next(error);
		}
	}

	static async createReviewForBooking(req, res, next) {
		try {
			const { booking_id } = req.params;
			const {
				rating,
				service_rating,
				guide_rating,
				value_rating,
				comment,
			} = req.body;

			const reviewId = await Review.create({
				booking_id,
				rating,
				service_rating,
				guide_rating,
				value_rating,
				comment,
			});

			const review = await Review.findById(reviewId);

			res.status(201).json({
				status: 'success',
				data: { review },
			});
		} catch (error) {
			next(error);
		}
	}

	static async getReviewById(req, res, next) {
		try {
			const { id } = req.params;
			const review = await Review.findById(id);

			res.json({
				status: 'success',
				data: { review },
			});
		} catch (error) {
			next(error);
		}
	}

	static async getReviewsForGuide(req, res, next) {
		try {
			const { guide_id } = req.params;
			const reviews = await Review.findByGuideId(guide_id);

			res.json({
				status: 'success',
				data: {
					reviews,
					total: reviews.length,
					average_rating:
						reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length,
				},
			});
		} catch (error) {
			next(error);
		}
	}

	static async getReviewsForTour(req, res, next) {
		try {
			const { tour_id } = req.params;
			const reviews = await Review.findByTourId(tour_id);

			res.json({
				status: 'success',
				data: {
					reviews,
					total: reviews.length,
					average_rating:
						reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length,
				},
			});
		} catch (error) {
			next(error);
		}
	}

	static async getReviewsForBooking(req, res, next) {
		try {
			const { booking_id } = req.params;
			const reviews = await Review.findByBookingId(booking_id);

			res.json({
				status: 'success',
				data: {
					reviews,
					total: reviews.length,
					average_rating:
						reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length,
				},
			});
		} catch (error) {
			next(error);
		}
	}

	static async getGuideReviews(req, res, next) {
		try {
			const { guide_id } = req.params;
			const reviews = await Review.findByGuideId(guide_id);

			res.json({
				status: 'success',
				data: {
					reviews,
					total: reviews.length,
					average_rating:
						reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length,
				},
			});
		} catch (error) {
			next(error);
		}
	}
}

module.exports = ReviewController;