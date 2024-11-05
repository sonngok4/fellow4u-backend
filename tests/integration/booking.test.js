// tests/integration/booking.test.js
const request = require('supertest');
const app = require('../../src/app');
const { setupTestDatabase, clearTestDatabase } = require('../setup');
const { JWTUtil } = require('../../src/utils/jwt.util');
const { PasswordUtil } = require('../../src/utils/password.util');

describe('Booking Integration Tests', () => {
	let connection;
	let authToken;
	let tourId;
	let userId;

	beforeAll(async () => {
		try {
			connection = await setupTestDatabase();

			// Create test user
			const [
				userResult,
			] = await connection.query(
				'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
				[
					'test@example.com',
					await PasswordUtil.hashPassword('Password123!'),
					'Test User',
				],
			);
			userId = userResult.insertId;

			// Create test tour
			const [
				tourResult,
			] = await connection.query(
				'INSERT INTO tours (name, description, price, duration, max_group_size) VALUES (?, ?, ?, ?, ?)',
				['Test Tour', 'Test Description', 100, 3, 10],
			);
			tourId = tourResult.insertId;

			authToken = JWTUtil.generateToken({ id: userId });
		} catch (error) {
			console.error('Test setup failed:', error);
			throw error;
		}
	});

	afterAll(async () => {
		if (connection) {
			await connection.end();
		}
	});

	beforeEach(async () => {
		await clearTestDatabase(connection);
	});

	describe('POST /api/bookings', () => {
		it('should create a booking successfully', async () => {
			// Recreate test data since clearTestDatabase was called
			const [
				userResult,
			] = await connection.query(
				'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
				[
					'test@example.com',
					await PasswordUtil.hashPassword('Password123!'),
					'Test User',
				],
			);

			const [
				tourResult,
			] = await connection.query(
				'INSERT INTO tours (name, description, price, duration, max_group_size) VALUES (?, ?, ?, ?, ?)',
				['Test Tour', 'Test Description', 100, 3, 10],
			);

			const response = await request(app)
				.post('/api/bookings')
				.set('Authorization', `Bearer ${authToken}`)
				.send({
					tourId: tourResult.insertId,
					date: '2024-12-01',
					numberOfPeople: 2,
				});

			expect(response.status).toBe(201);
			expect(response.body.booking).toHaveProperty(
				'tourId',
				tourResult.insertId,
			);
			expect(response.body.booking).toHaveProperty('totalAmount', 200);

			// Verify booking was saved in database
			const [
				rows,
			] = await connection.query(
				'SELECT * FROM bookings WHERE user_id = ? AND tour_id = ?',
				[userResult.insertId, tourResult.insertId],
			);
			expect(rows.length).toBe(1);
			expect(rows[0].number_of_people).toBe(2);
		});
	});
});
