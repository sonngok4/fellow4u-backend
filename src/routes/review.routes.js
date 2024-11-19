// routes/review.routes.js
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

// Review routes
router.get('/tours/:tourId/reviews', reviewController.getReviewsForTour);
router.get('/bookings/:bookingId/reviews', reviewController.getReviewsForBooking);
router.get('/:id', reviewController.getReviewById);
router.post(
    '/tours/:tourId/reviews',
    authMiddleware,
    reviewController.createReviewForTour,
);
router.post(
    '/bookings/:bookingId/reviews',
    authMiddleware,
    reviewController.createReviewForBooking,
);

module.exports = router;