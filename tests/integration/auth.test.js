// tests/integration/auth.test.js
const request = require('supertest');
const app = require('../../src/app');
const mysql = require('mysql2/promise');
const { JWTUtil } = require('../../src/utils/jwt.util');
const { setupTestDatabase, clearTestDatabase } = require('../setup');

const { PasswordUtil } = require('../../src/utils/password.util');

jest.mock('mysql2/promise');


describe('Auth Integration Tests', () => {
	let connection;

	beforeAll(async () => {
		connection = await setupTestDatabase();
	});

	afterAll(async () => {
		await connection.end();
	});

	beforeEach(async () => {
		await clearTestDatabase(connection);
	});

	describe('POST /api/auth/register', () => {
		it('should register a new user successfully', async () => {
			const response = await request(app).post('/api/auth/register').send({
				email: 'test@example.com',
				password: 'Password123!',
				full_name: 'Test User',
			});

			expect(response.status).toBe(201);
			expect(response.body).toHaveProperty('token');
			expect(response.body.user).toHaveProperty('email', 'test@example.com');

			// Verify user was actually saved in database
			const [
				rows,
			] = await connection.query('SELECT * FROM users WHERE email = ?', [
				'test@example.com',
			]);
			expect(rows.length).toBe(1);
			expect(rows[0].name).toBe('Test User');
		});
	});
});
