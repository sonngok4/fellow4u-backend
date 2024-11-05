const mysql = require('mysql2');
require('dotenv').config();

class Database {
	constructor() {
		this.pool = mysql
			.createPool({
				host: process.env.DB_HOST,
				user: process.env.DB_USER,
				password: process.env.DB_PASS,
				database: process.env.DB_NAME,
				waitForConnections: true,
				connectionLimit: 10,
				queueLimit: 0,
				// Thêm các options để tăng tính ổn định
				enableKeepAlive: true,
				keepAliveInitialDelay: 0,
				timezone: '+00:00',
				// Thêm timeout configs
				connectTimeout: 10000, // 10 seconds
				// acquireTimeout: 10000, // 10 seconds
			})
			.promise();

		// Listening for pool events
		this.pool.pool.on('connection', connection => {
			console.log('✅ New connection established with database');
		});

		this.pool.pool.on('release', connection => {
			console.log('📤 Connection released');
		});

		this.pool.pool.on('error', err => {
			console.error('❌ Database pool error:', err.message);
			this.handleError(err);
		});
	}

	async checkConnection() {
		try {
			const connection = await this.pool.getConnection();
			console.log('✅ MySQL Database connected successfully');

			// Test query để đảm bảo connection hoạt động
			await connection.query('SELECT 1');

			connection.release();
			return true;
		} catch (error) {
			console.error('❌ Database connection failed:', error.message);
			throw error;
		}
	}

	async executeQuery(sql, params = []) {
		try {
			const [results] = await this.pool.query(sql, params);
			return results;
		} catch (error) {
			console.error('❌ Query execution error:', error.message);
			throw error;
		}
	}

	static async handleError(error) {
		// Implement reconnection logic or other error handling
		if (error.code === 'PROTOCOL_CONNECTION_LOST') {
			console.error('Database connection was closed.');
		}
		if (error.code === 'ER_CON_COUNT_ERROR') {
			console.error('Database has too many connections.');
		}
		if (error.code === 'ECONNREFUSED') {
			console.error('Database connection was refused.');
		}
	}

	static async end() {
		try {
			await this.pool.end();
			console.log('✅ All pool connections closed');
		} catch (error) {
			console.error('❌ Error closing pool connections:', error.message);
			throw error;
		}
	}
}

// Singleton instance
const database = new Database();

module.exports = database;
