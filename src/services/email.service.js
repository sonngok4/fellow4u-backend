// src/services/email.service.js
const nodemailer = require('nodemailer');
const config = require('../configs/environment');
const Logger = require('../utils/logger.util');

class EmailService {
	static transporter = nodemailer.createTransport({
		host: config.EMAIL.HOST,
		port: config.EMAIL.PORT,
		secure: config.EMAIL.SECURE,
		auth: {
			user: config.EMAIL.USER,
			pass: config.EMAIL.PASSWORD,
		},
	});

	static async sendWelcomeEmail(user) {
		try {
			const mailOptions = {
				from: config.EMAIL.FROM_ADDRESS,
				to: user.email,
				subject: 'Welcome to Fellow4u!',
				html: `
                    <h1>Welcome to Fellow4u, ${user.name}!</h1>
                    <p>Thank you for joining our community. We're excited to have you on board!</p>
                    <p>Start exploring amazing tours and create unforgettable memories with us.</p>
                    <p>Best regards,</p>
                    <p>The Fellow4u Team</p>
                `,
			};

			const result = await this.transporter.sendMail(mailOptions);
			Logger.info(`Welcome email sent to ${user.email}`);
			return result;
		} catch (error) {
			Logger.error('Error sending welcome email:', error);
			throw error;
		}
	}

	static async sendBookingConfirmation(booking, user) {
		try {
			const mailOptions = {
				from: config.EMAIL.FROM_ADDRESS,
				to: user.email,
				subject: 'Booking Confirmation - Fellow4u',
				html: `
                    <h1>Booking Confirmation</h1>
                    <p>Dear ${user.name},</p>
                    <p>Your booking for ${booking.tour
											.name} has been confirmed!</p>
                    <h2>Booking Details:</h2>
                    <ul>
                        <li>Tour: ${booking.tour.name}</li>
                        <li>Date: ${booking.date}</li>
                        <li>Number of People: ${booking.numberOfPeople}</li>
                        <li>Total Amount: $${booking.totalAmount}</li>
                    </ul>
                    <p>Thank you for choosing Fellow4u!</p>
                    <p>Best regards,</p>
                    <p>The Fellow4u Team</p>
                `,
			};

			const result = await this.transporter.sendMail(mailOptions);
			Logger.info(`Booking confirmation email sent to ${user.email}`);
			return result;
		} catch (error) {
			Logger.error('Error sending booking confirmation:', error);
			throw error;
		}
	}
}

module.exports = EmailService;
