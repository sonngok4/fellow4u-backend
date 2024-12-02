// routes/tour.routes.js
const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tour.controller');
const {
	authMiddleware,
	guideMiddleware,
} = require('../middlewares/auth.middleware');
const { validateTour } = require('../middlewares/validation.middleware');

// Tour management routes (for guides)
router.post(
	'/',
	authMiddleware,
	guideMiddleware,
	validateTour,
	tourController.createTour,
);
router.put(
	'/:id',
	authMiddleware,
	guideMiddleware,
	validateTour,
	tourController.updateTour,
);
router.delete(
	'/:id',
	authMiddleware,
	guideMiddleware,
	tourController.deleteTour,
);

router.post('/add', authMiddleware, tourController.createTour);


// Public tour routes
router.get('/', tourController.getAllTours);
router.get('/search', tourController.searchTours);
router.get('/featured', tourController.getFeaturedTours);
router.get('/:id', tourController.getTourById);
router.get('/:id/reviews', tourController.getTourReviews);
router.get('/:id/availability', tourController.getTourAvailability);

module.exports = router;
