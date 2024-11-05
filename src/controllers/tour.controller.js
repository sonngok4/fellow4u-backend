// controllers/tour.controller.js
const Tour= require('../models/tour.model');
const Guide = require('../models/guide.model');

class TourController {
	static async createTour(req, res, next) {
		try {
			const guideId = req.guide.id; // Từ auth middleware
			const {
				title,
				description,
				destination,
				duration_days,
				max_participants,
				price_per_person,
				included_services,
				excluded_services,
			} = req.body;

			const tourId = await Tour.create({
				guide_id: guideId,
				title,
				description,
				destination,
				duration_days,
				max_participants,
				price_per_person,
				included_services,
				excluded_services,
			});

			const tour = await Tour.findById(tourId);

			res.status(201).json({
				status: 'success',
				data: { tour },
			});
		} catch (error) {
			next(error);
		}
	}

	static async getAllTours(req, res, next) {
		try {
			const tours = await Tour.findAll();
			res.json({
				status: 'success',
				data: { tours },
			});
		} catch (error) {
			next(error);
		}
	}

	static async getTour(req, res, next) {
		try {
			const { id } = req.params;
			const tour = await Tour.findById(id);

			if (!tour) {
				throw new ApiError(404, 'Tour not found');
			}

			res.json({
				status: 'success',
				data: { tour },
			});
		} catch (error) {
			next(error);
		}
	}

	static async getTourById(req, res, next) {
		try {
			const { id } = req.params;
			const tour = await Tour.findById(id);

			if (!tour) {
				throw new ApiError(404, 'Tour not found');
			}

			res.json({
				status: 'success',
				data: { tour },
			});
		} catch (error) {
			next(error);
		}
	}

	static async getFeaturedTours(req, res, next) {
		try {
			const tours = await Tour.getFeatured();
			res.json({
				status: 'success',
				data: { tours },
			});
		} catch (error) {
			next(error);
		}
	}

	static async getTourAvailability(req, res, next) {
		try {
			const { id } = req.params;
			const tour = await Tour.findById(id);
			if (!tour) {
				throw new ApiError(404, 'Tour not found');
			}
			res.json({
				status: 'success',
				data: { availability: tour.availability },
			});
		} catch (error) {
			next(error);
		}
    }
    
	static async searchTours(req, res, next) {
		try {
			const {
				destination,
				min_price,
				max_price,
				duration,
				start_date,
				guide_id,
			} = req.query;

			const tours = await Tour.search({
				destination,
				min_price,
				max_price,
				duration,
				start_date,
				guide_id,
			});

			res.json({
				status: 'success',
				data: { tours },
			});
		} catch (error) {
			next(error);
		}
	}

	static async getTourReviews(req, res, next) {
		try {
			const { id } = req.params;
			const tour = await Tour.findById(id);
			if (!tour) {
				throw new ApiError(404, 'Tour not found');
			}
			res.json({
				status: 'success',
				data: { reviews: tour.reviews },
			});
		} catch (error) {
			next(error);
		}
	}

	static async updateTour(req, res, next) {
		try {
			const { id } = req.params;
			const {
				title,
				description,
				destination,
				duration_days,
				max_participants,
				price_per_person,
				included_services,
				excluded_services,
			} = req.body;

			const tour = await Tour.update(id, {
				title,
				description,
				destination,
				duration_days,
				max_participants,
				price_per_person,
				included_services,
				excluded_services,
			});

			if (!tour) {
				throw new ApiError(404, 'Tour not found');
			}

			res.json({
				status: 'success',
				data: { tour },
			});
		} catch (error) {
			next(error);
		}
	}

	static async deleteTour(req, res, next) {
		try {
			const { id } = req.params;
			const tour = await Tour.delete(id);

			if (!tour) {
				throw new ApiError(404, 'Tour not found');
			}

			res.json({
				status: 'success',
				data: { tour },
			});
		} catch (error) {
			next(error);
		}
	}
}

module.exports = TourController;
