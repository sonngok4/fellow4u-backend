// src/app.js
const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config();
const database = require('./configs/database');
PORT = process.env.PORT || 3000;

const app = express();

const {
	errorHandler,
	notFoundHandler,
	apiLimiter,
	requestLogger,
} = require('./middlewares/error.middleware');

// Middlewares
// Apply global middlewares
app.use(express.json());
app.use(requestLogger);
app.use('/api', apiLimiter);
app.use(express.urlencoded({ extended: true }));


// Setup routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/guides', require('./routes/guide.routes'));
app.use('/api/tours', require('./routes/tour.routes'));
app.use('/api/bookings', require('./routes/booking.routes'));
app.use('/api/agencies', require('./routes/agency.routes'));

// Error handling middleware
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({
		status: 'error',
		message: 'Something went wrong!',
	});
});

// Apply error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Kiểm tra kết nối khi khởi động
const startServer = async () => {
    try {
        await database.checkConnection();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;
