// controllers/tour.controller.js
const Category = require('../models/category.model');
const Country = require('../models/country.model');
const ScheduleDetail = require('../models/scheduleDetail.model');
const Service = require('../models/service.model');
const Tour = require('../models/tour.model');
const TourCategory = require('../models/tourCategory.model');
const TourGalleries = require('../models/tourGalleries.model');
const TourSchedule = require('../models/tourSchedule.model');
const { ApiError } = require('../utils/api-error');
const { validateTour } = require('../middlewares/validation.middleware');
const env = require('../configs/environment');
const jwt = require('jsonwebtoken');
const { cloudinary } = require('../configs/cloudinary');
const City = require('../models/city.model');

class TourController {
	static async createTour(req, res, next) {
		try {
			// Lấy token từ header
			const token = req.headers.authorization.split(' ')[1]; // "Bearer <jwt_token>"

			// Giải mã token
			const decoded = jwt.verify(token, env.JWT_SECRET); // Giải mã token

			const { agency_id } = decoded; // Lấy shop_id từ token (nếu có, sẽ là null với khách hàng)
			console.log("agency_id:", agency_id);


			if (!agency_id) {
				return res.status(400).json({ message: 'Agency ID is required for tour owners' });
			}

			var {
				tour_name,
				category_id,
				country_id,
				city_id,
				service_id,
				itinerary,
				duration,
				departure_date,
				departure_place,
				cover_photo,
				description,
				price_adult,
				price_child,
				price_baby,
				galleries,
				schedules,
			} = req.body;

			console.log("tour_name:", tour_name);
			console.log("category_id:", category_id);
			console.log("country_id:", country_id);
			console.log("city_id:", city_id);
			console.log("service_id:", service_id);
			console.log("itinerary:", itinerary);
			console.log("duration:", duration);
			console.log("departure_date:", departure_date);
			console.log("departure_place:", departure_place);
			console.log("cover_photo:", cover_photo);
			console.log("description:", description);
			console.log("price_adult:", price_adult);
			console.log("price_child:", price_child);
			console.log("price_baby:", price_baby);
			console.log("schedules:", schedules);
			console.log("galleries:", galleries);

			schedules.forEach(schedule => {
				if (!Array.isArray(schedule.activities) || schedule.activities.length === 0) {
					return res.status(400).json({ message: 'Each schedule must have activities' });
				}
			});

			if (
				tour_name === undefined ||
				category_id === undefined ||
				country_id === undefined ||
				city_id === undefined ||
				service_id === undefined ||
				itinerary === undefined ||
				duration === undefined ||
				departure_date === undefined ||
				departure_place === undefined ||
				cover_photo === undefined ||
				description === undefined ||
				price_adult === undefined ||
				price_child === undefined ||
				price_baby === undefined ||
				schedules === undefined ||
				galleries === undefined
			) {
				return res.status(400).json({
					message: 'All fields are required',
					missingFields: {
						tour_name: tour_name === undefined,
						category_id: category_id === undefined,
						// ... add other fields similarly
						country_id: country_id === undefined,
						city_id: city_id === undefined,
						service_id: service_id === undefined,
						itinerary: itinerary === undefined,
						duration: duration === undefined,
						departure_date: departure_date === undefined,
						departure_place: departure_place === undefined,
						cover_photo: cover_photo === undefined,
						description: description === undefined,
						price_adult: price_adult === undefined,
						price_child: price_child === undefined,
						price_baby: price_baby === undefined,
						schedules: schedules === undefined,
						galleries: galleries === undefined
					}
				});
			}

			if (!req.body.cover_photo) {
				return res.status(400).json({ message: 'Cover photo is required' });
			}

			if (typeof price_adult !== 'number' || typeof price_child !== 'number' || typeof price_baby !== 'number') {
				return res.status(400).json({ message: 'Price fields must be numbers' });
			}


			if (typeof country_id !== 'number' || typeof city_id !== 'number' || typeof service_id !== 'number') {
				return res.status(400).json({ message: 'ID fields must be numbers' });
			}

			if (typeof category_id !== 'number') {
				return res.status(400).json({ message: 'Category ID must be a number' });
			}

			if (typeof itinerary !== 'string') {
				return res.status(400).json({ message: 'Itinerary must be a string' });
			}

			console.log("Authentication successful");
			console.log("Waiting for get public_id and cover_photo_url....");
			console.log("cover_photo:", cover_photo);

			// Upload cover photo to Cloudinary
			cover_photo = await cloudinary.uploader.upload(cover_photo, {
				resource_type: 'auto',
				folder: 'tours/cover_photo',
			})
			console.log("cover_photo:", cover_photo);

			console.log("cover_photo_url:", cover_photo.public_id, cover_photo.secure_url);

			console.log("Waiting for upload galleries photo to Cloudinary...");


			const categoryId = Category.findById(category_id);
			const countryId = Country.findById(country_id);
			const cityId = City.findById(city_id);
			const serviceId = Service.findById(service_id);

			if (!categoryId || !countryId || !cityId || !serviceId) {
				return res.status(404).json({ message: 'Category, country, city, or service not found' });
			}

			const tourId = await Tour.create({
				agency_id,
				tour_name,
				country_id,
				city_id,
				service_id,
				itinerary,
				duration,
				departure_date,
				departure_place,
				cover_photo,
				description,
				price_adult,
				price_child,
				price_baby,
			});

			console.log('tourId:', tourId);


			if (!tourId) {
				return res.status(500).json({ message: 'Failed to create tour' });
			}

			const tourCategory = await TourCategory.create({
				tour_id: tourId,
				category_id,
			});
			console.log('tourCategory:', tourCategory);

			/// Upload galleries photo to Cloudinary
			console.log("Waiting for upload galleries photo to Cloudinary...");
			galleries = await Promise.all(
				galleries.map(async (file) => {
					const result = await cloudinary.uploader.upload(file, {
						resource_type: 'auto',
						folder: 'tours/galleries',
					});

					// Trả về đối tượng chứa public_id và image_url
					return {
						public_id: result.public_id,
						image_url: result.secure_url,
					};
				}),
			);

			console.log("galleries:", galleries);  // In ra mảng chứa thông tin ảnh gallery


			const tourGalleries = await Promise.all(galleries.map(async (gallery) => {
				return await TourGalleries.createTourGallery({
					tour_id: tourId,
					public_id: gallery.public_id,
					image_url: gallery.image_url
				});
			}));

			console.log(tourGalleries ? "Tour galleries created successfully" : "No galleries");



			// {
			// 	"day_number": 1,
			// 		"summary": "Summary of Day 1: Exploring Da Nang and Ba Na Hills",
			// 			"activities": [
			// 				{ "time": "06:00", "activity": "Departure from Ho Chi Minh City" },
			// 				{ "time": "10:00", "activity": "Arrive in Da Nang and check into hotel" },
			// 				{ "time": "14:00", "activity": "Visit Ba Na Hills and Golden Bridge" },
			// 				{ "time": "19:00", "activity": "Dinner and free time at hotel" }
			// 			]
			// },
			// {
			// 	"day_number": 2,
			// 		"summary": "Summary of Day 2: Discovering Hoi An Ancient Town",
			// 			"activities": [
			// 				{ "time": "08:00", "activity": "Breakfast at hotel" },
			// 				{ "time": "09:00", "activity": "Tour of Hoi An Ancient Town" },
			// 				{ "time": "13:00", "activity": "Lunch and relax by the riverside" },
			// 				{ "time": "17:00", "activity": "Return to Ho Chi Minh City" }
			// 			]
			// }
			try {
				// Duyệt qua từng ngày (day_number) để tạo TourSchedule và ScheduleDetail
				for (let schedule of schedules) {
					// Tạo TourSchedule cho mỗi day_number
					const schedule_id = await TourSchedule.createTourSchedule({
						tour_id: tourId,
						day_number: schedule.day,
						summary: schedule.summary,
					});
					console.log(`Tour schedule for Day ${schedule.day} created successfully`);
					console.log("schedule_id:", schedule_id);


					// Tạo các ScheduleDetails cho từng activity của day_number hiện tại
					for (let activity of schedule.activities) {
						const schedule_detail_id = await ScheduleDetail.createScheduleDetail({
							schedule_id: schedule_id,
							time: activity.time,
							activity: activity.activity,
						});
						console.log(`Schedule detail for Day ${schedule.day} at ${activity.time} created successfully`);
						console.log("schedule_detail_id:", schedule_detail_id);

					}
				}

				console.log('All tour schedules and schedule details created successfully');
			} catch (error) {
				console.error('Error creating tour schedules or details:', error);
			}

			const tour = await Tour.findById(tourId);


			res.status(201).json({
				status: 'success',
				data: { tour},
			});
		} catch (error) {
			next(error);
		}
	}

	static async getAllTours(req, res, next) {
		try {
			const tours = await Tour.findAll();
			if (!tours) {
				throw new ApiError(404, 'Tours not found');
			}
			res.json({
				status: 'success',
				data: { tours: tours.length > 0 ? tours : ["not tours"], total: tours.length },
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
				tour_name,
				description,
				destination,
				duration_days,
				max_participants,
				price_per_person,
				included_services,
				excluded_services,
			} = req.body;

			const tour = await Tour.update(id, {
				tour_name,
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
