// tests/setup.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const testDbConfig = {
	host: process.env.MYSQL_TEST_HOST || 'localhost',
	user: process.env.MYSQL_TEST_USER || 'root',
	password: process.env.MYSQL_TEST_PASSWORD || '',
	database: process.env.MYSQL_TEST_DATABASE || 'fellow4u_test',
	multipleStatements: true, // Allow multiple statements for setup
};

async function setupTestDatabase() {
	let connection;
	try {
		// First connect without database to create it if needed
		connection = await mysql.createConnection({
			host: testDbConfig.host,
			user: testDbConfig.user,
			password: testDbConfig.password,
		});

		await connection.query(
			`CREATE DATABASE IF NOT EXISTS ${testDbConfig.database}`,
		);
		await connection.end();

		// Now connect to the test database
		const testConnection = await mysql.createConnection(testDbConfig);

		// Run your migrations here
		await runMigrations(testConnection);

		return testConnection;
	} catch (error) {
		console.error('Database setup error:', error);
		if (connection) await connection.end();
		throw error;
	}
}

async function runMigrations(connection) {
	// Add your migration queries here
	const migrations = [
		`CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      phone_number VARCHAR(20),
      avatar VARCHAR(255),
      role ENUM('user', 'admin') DEFAULT 'user',
      status ENUM('active', 'inactive') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
		`CREATE TABLE IF NOT EXISTS tours (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      duration INT NOT NULL,
      max_group_size INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
		`CREATE TABLE IF NOT EXISTS bookings (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      tour_id INT NOT NULL,
      date DATE NOT NULL,
      number_of_people INT NOT NULL,
      total_amount DECIMAL(10,2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (tour_id) REFERENCES tours(id)
    )`,
	];

	for (const migration of migrations) {
		await connection.query(migration);
	}
}
async function clearTestDatabase(connection) {
	if (!connection) return;

	const tables = [
		'bookings',
		'reviews',
		'tours',
		'users',
		'agencies',
		'guides',
	];

	try {
		await connection.query('SET FOREIGN_KEY_CHECKS = 0');
		for (const table of tables) {
			// Use `DROP TABLE IF EXISTS` instead of `TRUNCATE TABLE IF EXISTS`
			await connection.query(`DROP TABLE IF EXISTS ${table}`);
			// Then recreate the table with the proper schema
			await connection.query(`
        CREATE TABLE IF NOT EXISTS ${table} (
          id INT PRIMARY KEY AUTO_INCREMENT,
          -- Add the appropriate column definitions for each table
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
		}
		await connection.query('SET FOREIGN_KEY_CHECKS = 1');
	} catch (error) {
		console.error('Error clearing database:', error);
		throw error;
	}
}
module.exports = {
	setupTestDatabase,
	clearTestDatabase,
	testDbConfig,
};
