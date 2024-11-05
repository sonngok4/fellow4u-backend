// routes/guide.routes.js
const express = require('express');
const router = express.Router();
const guideController = require('../controllers/guide.controller');
const {
	authMiddleware,
	guideMiddleware,
} = require('../middlewares/auth.middleware');
const {
	validateGuideProfile,
	validateSearchParams,
} = require('../middlewares/validation.middleware');

// Protected guide routes
router.post(
	'/register',
	authMiddleware,
	validateGuideProfile,
	guideController.registerAsGuide,
);

router.get(
	'/profile',
	authMiddleware,
	guideMiddleware,
	guideController.getGuideProfile,
);

router.put(
	'/profile',
	authMiddleware,
	guideMiddleware,
	validateGuideProfile,
	guideController.updateGuideProfile,
);

router.get(
	'/tours',
	authMiddleware,
	guideMiddleware,
	guideController.getGuideTours,
);

router.get(
	'/bookings',
	authMiddleware,
	guideMiddleware,
	guideController.getGuideBookings,
);

router.get(
	'/reviews',
	authMiddleware,
	guideMiddleware,
	guideController.getGuideReviews,
);

router.get(
	'/stats',
	authMiddleware,
	guideMiddleware,
	guideController.getGuideStats,
);

router.put(
	'/availability',
	authMiddleware,
	guideMiddleware,
	guideController.updateAvailability,
);

// Public routes
router.get('/', validateSearchParams, guideController.getAllGuides);
router.get('/search', validateSearchParams, guideController.searchGuides);
router.get('/:id', guideController.getGuideById);
router.get('/:id/reviews', guideController.getGuideReviews);
router.get('/:id/tours', guideController.getGuideTours);

module.exports = router;
