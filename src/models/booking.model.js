// models/booking.model.js
const database = require("../configs/database");
class Booking {
	static async create(bookingData) {
		const sql = `
            INSERT INTO bookings (
                user_id, tour_id, start_date, end_date,
                number_of_people, total_price, status,
                payment_status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;
		const params = [
			bookingData.user_id,
			bookingData.tour_id,
			bookingData.start_date,
			bookingData.end_date,
			bookingData.number_of_people,
			bookingData.total_price,
			bookingData.status || 'pending',
			bookingData.payment_status || 'pending',
		];

		try {
			const [result] = await database.executeQuery(sql, params);
			return result.insertId;
		} catch (error) {
			throw error;
		}
	}

	static async findAll() {
		const sql = `
			SELECT b.*, t.title as tour_title, t.destination, u.full_name as guide_name, u.avatar as guide_avatar
			FROM bookings b
			JOIN tours t ON b.tour_id = t.id
			JOIN guides g ON t.guide_id = g.id
			JOIN users u ON g.user_id = u.id
			ORDER BY b.created_at DESC
		`;
		try {
			const bookings = await database.executeQuery(sql);
			return bookings;
		} catch (error) {
			throw error;
		}
	}

	static async findByUserId(userId) {
		const sql = `
            SELECT b.*, t.title as tour_title, t.destination, u.full_name as guide_name, u.avatar as guide_avatar
            FROM bookings b
            JOIN tours t ON b.tour_id = t.id
            JOIN guides g ON t.guide_id = g.id
            JOIN users u ON g.user_id = u.id
            WHERE b.user_id = ?
            ORDER BY b.created_at DESC
        `;
		try {
			const [bookings] = await database.executeQuery(sql, [userId]);
			return bookings;
		} catch (error) {
			throw error;
		}
	}
}

module.exports = Booking;