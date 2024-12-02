// middlewares/validation.middleware.js
const Joi = require('joi');

// User validation schemas
const registrationSchema = Joi.object({
	email: Joi.string().email().required(),
	password: Joi.string().min(8).required(),
	full_name: Joi.string().required(),
	phone_number: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
	role: Joi.string().valid('user', 'guide', 'agency').default('user'),
});

const loginSchema = Joi.object({
	email: Joi.string().email().required(),
	password: Joi.string().required(),
});

const userUpdateSchema = Joi.object({
	full_name: Joi.string(),
	phone_number: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
	avatar: Joi.string().uri(),
});

// Guide validation schemas
const guideProfileSchema = Joi.object({
	description: Joi.string().required(),
	experience_years: Joi.number().integer().min(0).required(),
	languages: Joi.array().items(Joi.string()).required(),
	specialties: Joi.array().items(Joi.string()).required(),
	price_per_day: Joi.number().positive().required(),
	availability: Joi.string()
		.valid('available', 'unavailable')
		.default('available'),
});

// tour_name,
// 	country_id,
// 	city_id,
// 	service_id,
// 	itinerary,
// 	duration,
// 	department_date,
// 	department_place,
// 	public_id,
// 	cover_photo,
// 	description,
// 	price_adult,
// 	price_child,
// 	price_baby,
// 	status,
// 	created_at
// Tour validation schemas
const tourSchema = Joi.object({
	tour_name: Joi.string().required(),
	country_id: Joi.number().integer().positive().required(),
	city_id: Joi.number().integer().positive().required(),
	service_id: Joi.number().integer().positive().required(),
	itinerary: Joi.string().required(),
	duration: Joi.string().required(),
	departure_place: Joi.string().required(),
	departure_date: Joi.string().required(),
	description: Joi.string().required(),
	max_participants: Joi.number().integer().positive().required(),
	price_per_person: Joi.number().positive().required(),
	status: Joi.string().valid('active', 'inactive').default('active'),
});

// Booking validation schemas
const bookingSchema = Joi.object({
	tour_id: Joi.number().integer().positive().required(),
	start_date: Joi.date().greater('now').required(),
	end_date: Joi.date().greater(Joi.ref('start_date')).required(),
	number_of_people: Joi.number().integer().positive().required(),
});

// Agency validation schemas
const agencySchema = Joi.object({
	company_name: Joi.string().required(),
	license_number: Joi.string().required(),
	description: Joi.string().required(),
	address: Joi.string().required(),
	website: Joi.string().uri(),
	employee_count: Joi.number().integer().positive().required(),
	established_year: Joi.number()
		.integer()
		.min(1900)
		.max(new Date().getFullYear())
		.required(),
	specialties: Joi.array().items(Joi.string()).required(),
	service_areas: Joi.array().items(Joi.string()).required(),
});

const searchParamsSchema = Joi.object({
	query: Joi.string().required(),
	limit: Joi.number().integer().min(1).max(100).default(10),
	offset: Joi.number().integer().min(0).default(0),
})
// Validation middleware functions
const validateRegistration = (req, res, next) => {
	const { error } = registrationSchema.validate(req.body);
	if (error) {
		return res.status(400).json({
			success: false,
			message: error.details[0].message,
		});
	}
	next();
};

const validateLogin = (req, res, next) => {
	const { error } = loginSchema.validate(req.body);
	if (error) {
		return res.status(400).json({
			success: false,
			message: error.details[0].message,
		});
	}
	next();
};

const validateUserUpdate = (req, res, next) => {
	const { error } = userUpdateSchema.validate(req.body);
	if (error) {
		return res.status(400).json({
			success: false,
			message: error.details[0].message,
		});
	}
	next();
};

const validateGuideProfile = (req, res, next) => {
	const { error } = guideProfileSchema.validate(req.body);
	if (error) {
		return res.status(400).json({
			success: false,
			message: error.details[0].message,
		});
	}
	next();
};

const validateTour = (req, res, next) => {
	const { error } = tourSchema.validate(req.body);
	if (error) {
		return res.status(400).json({
			success: false,
			message: error.details[0].message,
		});
	}
	next();
};

const validateBooking = (req, res, next) => {
	const { error } = bookingSchema.validate(req.body);
	if (error) {
		return res.status(400).json({
			success: false,
			message: error.details[0].message,
		});
	}
	next();
};

const validateAgency = (req, res, next) => {
	const { error } = agencySchema.validate(req.body);
	if (error) {
		return res.status(400).json({
			success: false,
			message: error.details[0].message,
		});
	}
	next();
};

const validateSearchParams = (req, res, next) => {
	const { error } = searchParamsSchema.validate(req.query);
	if (error) {
		return res.status(400).json({
			success: false,
			message: error.details[0].message,
		});
	}
	next();
};

module.exports = {
	validateRegistration,
	validateLogin,
	validateUserUpdate,
	validateGuideProfile,
	validateTour,
	validateBooking,
	validateAgency,
	validateSearchParams,
};
