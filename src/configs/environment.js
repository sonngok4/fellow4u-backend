// src/config/environment.js
require('dotenv').config();

module.exports = {
	NODE_ENV: process.env.NODE_ENV || 'development',
	PORT: process.env.PORT || 3000,
	DATABASE: {
		HOST: process.env.DB_HOST || 'localhost',
		USER: process.env.DB_USER || 'root',
		PASSWORD: process.env.DB_PASSWORD || '',
		NAME: process.env.DB_NAME || 'fellow4u_test',
		PORT: process.env.DB_PORT || 3306,
	},
	JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
	JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
	EMAIL: {
		HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
		PORT: parseInt(process.env.EMAIL_PORT, 10) || 587,
		SECURE: process.env.EMAIL_SECURE === 'true',
		USER: process.env.EMAIL_USER,
		PASSWORD: process.env.EMAIL_PASSWORD,
		FROM_ADDRESS: process.env.EMAIL_FROM_ADDRESS || 'noreply@fellow4u.com',
	},
};
