// controllers/guide.controller.js
const Guide = require('../models/guide.model');
const Review = require('../models/review.model');
const User = require('../models/user.model');
const ApiError = require('../utils/api-error');
const { validateLanguages, validateSpecialties } = require('../utils/validation.util');

class GuideController {
    static async registerAsGuide(req, res, next) {
        try {
            const userId = req.user.id;

            // Check if user is already a guide
            const existingGuide = await Guide.findByUserId(userId);
            if (existingGuide) {
                throw new ApiError(400, 'User is already registered as a guide');
            }

            const {
                description,
                experience_years,
                languages,
                specialties,
                price_per_day,
                availability,
            } = req.body;

            // Additional validations
            if (!description?.trim()) {
                throw new ApiError(400, 'Description is required');
            }

            if (!validateLanguages(languages)) {
                throw new ApiError(400, 'At least one valid language is required');
            }

            if (!validateSpecialties(specialties)) {
                throw new ApiError(400, 'At least one valid specialty is required');
            }

            const price = parseFloat(price_per_day);
            if (isNaN(price) || price <= 0) {
                throw new ApiError(400, 'Invalid price per day');
            }

            const guideId = await Guide.create({
                user_id: userId,
                description: description.trim(),
                experience_years: parseInt(experience_years) || 0,
                languages,
                specialties,
                price_per_day: price,
                availability: availability || 'available',
            });

            const guide = await Guide.findByUserId(userId);

            res.status(201).json({
                status: 'success',
                data: { guide },
            });
        } catch (error) {
            next(error);
        }
    }

    static async getGuideProfile(req, res, next) {
        try {
            const userId = req.params.id || req.user.id;
            const guide = await Guide.findByUserId(userId);

            if (!guide) {
                throw new ApiError(404, 'Guide not found');
            }

            // Get additional statistics
            const stats = await Promise.all([
                Review.getGuideStats(guide.id),
                Guide.getBookingStats(guide.id)
            ]);

            const [reviewStats, bookingStats] = stats;

            res.json({
                status: 'success',
                data: { 
                    guide,
                    stats: {
                        reviews: reviewStats,
                        bookings: bookingStats
                    }
                },
            });
        } catch (error) {
            next(error);
        }
    }

    static async updateGuideProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const {
                description,
                experience_years,
                languages,
                specialties,
                price_per_day,
                availability,
            } = req.body;

            const guide = await Guide.findByUserId(userId);
            if (!guide) {
                throw new ApiError(404, 'Guide not found');
            }

            // Authorization check
            if (guide.user_id !== userId) {
                throw new ApiError(403, 'Not authorized to update this guide profile');
            }

            // Validation
            if (description && !description.trim()) {
                throw new ApiError(400, 'Description cannot be empty');
            }

            if (languages && !validateLanguages(languages)) {
                throw new ApiError(400, 'Invalid languages format');
            }

            if (specialties && !validateSpecialties(specialties)) {
                throw new ApiError(400, 'Invalid specialties format');
            }

            if (price_per_day && (isNaN(parseFloat(price_per_day)) || parseFloat(price_per_day) <= 0)) {
                throw new ApiError(400, 'Invalid price per day');
            }

            const updated = await Guide.update(userId, {
                description: description?.trim(),
                experience_years: experience_years ? parseInt(experience_years) : undefined,
                languages,
                specialties,
                price_per_day: price_per_day ? parseFloat(price_per_day) : undefined,
                availability,
            });

            const updatedGuide = await Guide.findByUserId(userId);

            res.json({
                status: 'success',
                data: { guide: updatedGuide },
            });
        } catch (error) {
            next(error);
        }
    }

    static async searchGuides(req, res, next) {
        try {
            const {
                languages,
                specialties,
                min_price,
                max_price,
                availability,
                location,
                min_rating,
                page = 1,
                limit = 10,
            } = req.query;

            // Validate parameters
            if (min_price && (isNaN(parseFloat(min_price)) || parseFloat(min_price) < 0)) {
                throw new ApiError(400, 'Invalid minimum price');
            }

            if (max_price && (isNaN(parseFloat(max_price)) || parseFloat(max_price) < 0)) {
                throw new ApiError(400, 'Invalid maximum price');
            }

            if (min_price && max_price && parseFloat(min_price) > parseFloat(max_price)) {
                throw new ApiError(400, 'Minimum price cannot be greater than maximum price');
            }

            const [guides, total] = await Promise.all([
                Guide.search({
                    languages: languages?.split(','),
                    specialties: specialties?.split(','),
                    min_price: parseFloat(min_price),
                    max_price: parseFloat(max_price),
                    availability,
                    location,
                    min_rating: parseFloat(min_rating),
                    page: parseInt(page),
                    limit: parseInt(limit),
                }),
                Guide.countSearch({
                    languages: languages?.split(','),
                    specialties: specialties?.split(','),
                    min_price: parseFloat(min_price),
                    max_price: parseFloat(max_price),
                    availability,
                    location,
                    min_rating: parseFloat(min_rating),
                })
            ]);

            res.json({
                status: 'success',
                data: { 
                    guides,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        pages: Math.ceil(total / limit)
                    }
                },
            });
        } catch (error) {
            next(error);
        }
    }

	// ... other methods remain the same ...

	static async getAllGuides(req, res, next) {
		try {
			const guides = await Guide.findAll();
			res.json({
				status: 'success',
				data: { guides },
			});
		} catch (error) {
			next(error);
		}
	}

	static async getGuideTours(req, res, next) {
		try {
			const userId = req.params.id || req.user.id;
			const guide = await Guide.findByUserId(userId);
			if (!guide) {
				throw new ApiError(404, 'Guide not found');
			}
			res.json({
				status: 'success',
				data: { tours: guide.tours },
			});
		} catch (error) {
			next(error);
		}
	}

	static async getGuideById(req, res, next) {
		try {
			const userId = req.params.id || req.user.id;
			const guide = await Guide.findByUserId(userId);
			if (!guide) {
				throw new ApiError(404, 'Guide not found');
			}
			res.json({
				status: 'success',
				data: { guide },
			});
		} catch (error) {
			next(error);
		}
	}

    static async updateAvailability(req, res, next) {
        try {
            const userId = req.user.id;
            const { availability } = req.body;

            if (!['available', 'unavailable'].includes(availability)) {
                throw new ApiError(400, 'Invalid availability status');
            }

            const guide = await Guide.findByUserId(userId);
            if (!guide) {
                throw new ApiError(404, 'Guide not found');
            }

            await Guide.updateAvailability(userId, availability);
            const updatedGuide = await Guide.findByUserId(userId);

            // Notify any affected bookings
            if (availability === 'unavailable') {
                await Guide.notifyUpcomingBookings(userId, 'GUIDE_UNAVAILABLE');
            }

            res.json({
                status: 'success',
                data: { guide: updatedGuide },
            });
        } catch (error) {
            next(error);
        }
    }

    static async getGuideStats(req, res, next) {
        try {
            const userId = req.user.id;
            const guide = await Guide.findByUserId(userId);
            
            if (!guide) {
                throw new ApiError(404, 'Guide not found');
            }

            const [reviews, bookings, earnings] = await Promise.all([
                Review.getGuideStats(guide.id),
                Guide.getBookingStats(guide.id),
                Guide.getEarningsStats(guide.id)
            ]);

            res.json({
                status: 'success',
                data: {
                    reviews,
                    bookings,
                    earnings
                }
            });
        } catch (error) {
            next(error);
        }
	}
	
	static async getGuideBookings(req, res, next) {
		try {
			const userId = req.user.id;
			const guide = await Guide.findByUserId(userId);
			if (!guide) {
				throw new ApiError(404, 'Guide not found');
			}
			const bookings = await Booking.getGuideBookings(guide.id);
			res.json({
				status: 'success',
				data: { bookings },
			});
		} catch (error) {
			next(error);
		}
	}

	static async getGuideReviews(req, res, next) {
		try {
			const userId = req.user.id;
			const guide = await Guide.findByUserId(userId);
			if (!guide) {
				throw new ApiError(404, 'Guide not found');
			}
			const reviews = await Review.getGuideReviews(guide.id);
			res.json({
				status: 'success',
				data: { reviews },
			});
		} catch (error) {
			next(error);
		}
	}


}

module.exports = GuideController;