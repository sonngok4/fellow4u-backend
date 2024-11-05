// routes/agency.routes.js
const express = require('express');
const router = express.Router();
const agencyController = require('../controllers/agency.controller');
const {
	authMiddleware,
	agencyMiddleware,
} = require('../middlewares/auth.middleware');
const { validateAgency } = require('../middlewares/validation.middleware');

// Agency management routes
router.post(
	'/register',
	authMiddleware,
	validateAgency,
	agencyController.registerAgency,
);
router.get(
	'/profile',
	authMiddleware,
	agencyMiddleware,
	agencyController.getAgencyProfile,
);
router.put(
	'/profile',
	authMiddleware,
	agencyMiddleware,
	validateAgency,
	agencyController.updateAgencyProfile,
);
router.delete(
	'/account',
	authMiddleware,
	agencyMiddleware,
	agencyController.deleteAgency,
);

// Guide management routes
router.post(
	'/guides',
	authMiddleware,
	agencyMiddleware,
	agencyController.addGuideToAgency,
);
router.delete(
	'/guides/:guideId',
	authMiddleware,
	agencyMiddleware,
	agencyController.removeGuideFromAgency,
);
router.get(
	'/guides',
	authMiddleware,
	agencyMiddleware,
	agencyController.getAgencyGuides,
);

// Public routes
router.get('/', agencyController.getAllAgencies);
router.get('/:id', agencyController.getAgencyById);
router.get('/:id/guides', agencyController.getPublicAgencyGuides);
router.get('/:id/tours', agencyController.getAgencyTours);

module.exports = router;
