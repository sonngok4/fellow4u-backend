// routes/booking.routes.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const {
	authMiddleware,
	guideMiddleware,
} = require('../middlewares/auth.middleware');
const { validateBooking } = require('../middlewares/validation.middleware');

// Booking routes for users
router.get("/", bookingController.getAllBookings);
router.post(
	'/new',
	authMiddleware,
	validateBooking,
	bookingController.createBooking,
);
router.get('/my-bookings', authMiddleware, bookingController.getUserBookings);
router.get('/:id', authMiddleware, bookingController.getBookingById);
router.put('/:id/cancel', authMiddleware, bookingController.cancelBooking);

// Booking routes for guides
router.get(
	'/guide-bookings',
	authMiddleware,
	guideMiddleware,
	bookingController.getGuideBookings,
);
router.put(
	'/:id/status',
	authMiddleware,
	guideMiddleware,
	bookingController.updateBookingStatus,
);

// Payment routes
router.post('/:id/payment', authMiddleware, bookingController.processPayment);
router.get(
	'/:id/payment-status',
	authMiddleware,
	bookingController.getPaymentStatus,
);

module.exports = router;
