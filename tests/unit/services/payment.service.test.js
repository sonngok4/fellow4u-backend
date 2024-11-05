// tests/unit/services/payment.service.test.js
const PaymentService = require('../../../src/services/payment.service');
const stripe = require('stripe');
const mysql = require('mysql2/promise');
const { setupTestDatabase, clearTestDatabase } = require('../../setup');

jest.mock('stripe', () => {
	return jest.fn(() => ({
		paymentIntents: {
			create: jest.fn().mockResolvedValue({
				id: 'pi_123',
				client_secret: 'secret_123',
			}),
			retrieve: jest.fn().mockResolvedValue({
				status: 'succeeded',
			}),
		},
		refunds: {
			create: jest.fn().mockResolvedValue({
				id: 'rf_123',
			}),
		},
	}));
});

describe('PaymentService', () => {
	let stripeClient;
	let connection;

	beforeAll(async () => {
		connection = await setupTestDatabase();
	});

	afterAll(async () => {
		await connection.end();
	});

	beforeEach(async () => {
		await clearTestDatabase(connection);
		stripeClient = stripe();
	});

	it('should create payment intent and save transaction record', async () => {
		const paymentIntent = await PaymentService.createPaymentIntent(100);

		// Verify payment intent was created in Stripe
		expect(paymentIntent).toEqual({
			id: 'pi_123',
			client_secret: 'secret_123',
		});
		expect(stripeClient.paymentIntents.create).toHaveBeenCalledWith({
			amount: 10000, // Amount is in cents, so 100 dollars is 10000 cents
			currency: 'usd',
		});

		// Verify transaction record was saved in database
		const [
			rows,
		] = await connection.query(
			'SELECT * FROM transactions WHERE stripe_payment_intent_id = ?',
			['pi_123'],
		);
		expect(rows.length).toBe(1);
		expect(rows[0].amount).toBe(100);
	});
});
