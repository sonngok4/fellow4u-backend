// tests/unit/services/email.service.test.js
const EmailService = require('../../../src/services/email.service');
const nodemailer = require('nodemailer');
const Logger = require('../../../src/utils/logger.util');

jest.mock('nodemailer');
jest.mock('../../../src/utils/logger.util.js');
jest.mock('../../../src/configs/environment', () => ({
	EMAIL: {
		HOST: 'test.smtp.com',
		PORT: 587,
		SECURE: false,
		USER: 'test@example.com',
		PASSWORD: 'test-password',
		FROM_ADDRESS: 'noreply@fellow4u.com',
	},
}));

describe('EmailService', () => {
	let mockTransporter;

	beforeEach(() => {
		mockTransporter = {
			sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' }),
		};
		nodemailer.createTransport.mockReturnValue(mockTransporter);

		// Re-initialize the transporter for each test
		EmailService.transporter = mockTransporter;
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('sendWelcomeEmail', () => {
		it('should send welcome email successfully', async () => {
			const user = { email: 'test@example.com', name: 'Test User' };

			await EmailService.sendWelcomeEmail(user);

			expect(mockTransporter.sendMail).toHaveBeenCalledWith({
				from: 'noreply@fellow4u.com',
				to: user.email,
				subject: 'Welcome to Fellow4u!',
				html: expect.stringContaining(user.name),
			});
			expect(Logger.info).toHaveBeenCalledWith(
				`Welcome email sent to ${user.email}`,
			);
		});

		it('should handle errors when sending welcome email', async () => {
			const user = { email: 'test@example.com', name: 'Test User' };
			const error = new Error('SMTP error');
			mockTransporter.sendMail.mockRejectedValue(error);

			await expect(EmailService.sendWelcomeEmail(user)).rejects.toThrow(error);
			expect(Logger.error).toHaveBeenCalledWith(
				'Error sending welcome email:',
				error,
			);
		});
	});

	describe('sendBookingConfirmation', () => {
		it('should send booking confirmation email successfully', async () => {
			const user = { email: 'test@example.com', name: 'Test User' };
			const booking = {
				tour: { name: 'Test Tour' },
				date: '2024-12-01',
				numberOfPeople: 2,
				totalAmount: 100,
			};

			await EmailService.sendBookingConfirmation(booking, user);

			expect(mockTransporter.sendMail).toHaveBeenCalledWith({
				from: 'noreply@fellow4u.com',
				to: user.email,
				subject: 'Booking Confirmation - Fellow4u',
				html: expect.stringContaining(booking.tour.name),
			});
			expect(Logger.info).toHaveBeenCalledWith(
				`Booking confirmation email sent to ${user.email}`,
			);
		});

		it('should handle errors when sending booking confirmation', async () => {
			const user = { email: 'test@example.com', name: 'Test User' };
			const booking = {
				tour: { name: 'Test Tour' },
				date: '2024-12-01',
				numberOfPeople: 2,
				totalAmount: 100,
			};
			const error = new Error('SMTP error');
			mockTransporter.sendMail.mockRejectedValue(error);

			await expect(
				EmailService.sendBookingConfirmation(booking, user),
			).rejects.toThrow(error);
			expect(Logger.error).toHaveBeenCalledWith(
				'Error sending booking confirmation:',
				error,
			);
		});
	});
});
