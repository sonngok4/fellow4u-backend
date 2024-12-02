// models/user.model.js
const database = require('../configs/database');

class User {
	static async create(userData) {
		const sql = `
            INSERT INTO Users (
                email, password, full_name, phone_number, 
                avatar, role, status,	 created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        `;
		const params = [
			userData.email,
			userData.password,
			userData.full_name,
			userData.phone_number,
			userData.avatar || null,
			userData.role || 'user',
			userData.status || 'active',
		];

		try {
			const result = await database.executeQuery(sql, params);
			console.log("result", result.insertId);
			return result.insertId;
		} catch (error) {
			throw error;
		}
	}

	static async findAll() {
		const sql = 'SELECT * FROM Users';
		try {
			const users = await database.executeQuery(sql);
			return users;
		} catch (error) {
			throw error;
		}
	}

	static async findByEmail(email) {
		const sql = 'SELECT * FROM Users WHERE email = ?';
		try {
			const [users] = await database.executeQuery(sql, [email]);
			console.log("find by email", users);
			return users || null;
		} catch (error) {
			throw error;
		}
	}

	static async findById(id) {
		const sql = 'SELECT * FROM Users WHERE id = ?';
		try {
			const [users] = await database.executeQuery(sql, [id]);
			return users;
		} catch (error) {
			throw error;
		}
	}
}

module.exports = User;
