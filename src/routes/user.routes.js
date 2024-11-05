// routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { validateUserUpdate } = require('../middlewares/validation.middleware');

// User routes
router.get('/', userController.getAllUsers);
router.get('/profile', authMiddleware, userController.getProfile);
router.put(
	'/profile',
	authMiddleware,
	validateUserUpdate,
	userController.updateProfile,
);
router.put('/change-password', authMiddleware, userController.changePassword);
router.delete('/account', authMiddleware, userController.deleteAccount);
router.get('/bookings', authMiddleware, userController.getUserBookings);
router.get('/reviews', authMiddleware, userController.getUserReviews);

module.exports = router;
