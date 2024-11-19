// src/app.js
const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config();
const cors = require('cors');
const database = require('./configs/database');
const { configureCloudinary } = require('./configs/cloudinary');
PORT = process.env.PORT || 3000;

const app = express();

const {
	errorHandler,
	notFoundHandler,
	apiLimiter,
	requestLogger,
} = require('./middlewares/error.middleware');

// Middlewares

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'], // Thêm tất cả domain frontend cần thiết
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
// Apply global middlewares
app.use(express.json());
// Server side - Thêm log middleware
app.use((req, res, next) => {
    const oldJson = res.json;
    res.json = function (data) {
        console.log('Response data:', data);
        return oldJson.call(this, data);
    };
    next();
});
app.use(requestLogger);
app.use('/api', apiLimiter);
app.use(express.urlencoded({ extended: true }));


// Setup routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/guides', require('./routes/guide.routes'));
app.use('/api/tours', require('./routes/tour.routes'));
app.use('/api/upload', require('./routes/uploadTourImage.routes'))
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

        // Kiem tra ket noi voi database
        await database.checkConnection();

        // Kiểm tra kết nối Cloudinary
        const cloudinaryConnected = await configureCloudinary();
        if (!cloudinaryConnected) {
            throw new Error('Unable to connect to Cloudinary');
        }
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