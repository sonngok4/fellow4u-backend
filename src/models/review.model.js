// models/review.model.js
const database = require("../configs/database");
class Review {
	static async create(reviewData) {
		const sql = `
            INSERT INTO Reviews (
                booking_id, rating, comment, 
                service_rating, guide_rating, value_rating,
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;
		const params = [
			reviewData.booking_id,
			reviewData.rating,
			reviewData.comment,
			reviewData.service_rating,
			reviewData.guide_rating,
			reviewData.value_rating,
		];

		try {
			const [result] = await database.executeQuery(sql, params);
			// Update average ratings for guide/tour after adding review
			await this.updateAverageRatings(reviewData.booking_id);
			return result.insertId;
		} catch (error) {
			throw error;
		}
	}

	static async findById(reviewId) {
		const sql = `
			SELECT r.*, 
				   b.user_id as reviewer_id,
				   u.full_name as reviewer_name,
				   u.avatar as reviewer_avatar
			FROM Reviews r
			JOIN Bookings b ON r.booking_id = b.id
			JOIN Users u ON b.user_id = u.id
			WHERE r.id = ?
		`;
		try {
			const [reviews] = await database.executeQuery(sql, [reviewId]);
			return reviews[0];
		} catch (error) {
			throw error;
		}
	}
	static async findByBookingAll(bookingId) {
		const sql = `
			SELECT r.*, 
				   b.user_id as reviewer_id,
				   u.full_name as reviewer_name,
				   u.avatar as reviewer_avatar
			FROM Reviews r
			JOIN Bookings b ON r.booking_id = b.id
			JOIN Users u ON b.user_id = u.id
			WHERE r.booking_id = ?
		`;
		try {
			return database.executeQuery(sql, [bookingId]);
		} catch (error) {
			throw error;
		}
	}

	static async updateAverageRatings(bookingId) {
		const sql = `
			UPDATE Bookings
			SET average_rating = (
				SELECT AVG(rating)
				FROM Reviews r
				WHERE r.booking_id = ?
			)
		`;
		try {
			await database.executeQuery(sql, [bookingId]);
		} catch (error) {
			throw error;
		}
	}

	static async findByBookingId(bookingId) {
		const sql = `
            SELECT r.*, 
                   b.user_id as reviewer_id,
                   u.full_name as reviewer_name,
                   u.avatar as reviewer_avatar
            FROM Reviews r
            JOIN Bookings b ON r.booking_id = b.id
            JOIN Users u ON b.user_id = u.id
            WHERE r.booking_id = ?
        `;
		try {
			const [reviews] = await database.executeQuery(sql, [bookingId]);
			return reviews[0];
		} catch (error) {
			throw error;
		}
	}

	static async findByTourAll(tourId) {
		const sql = `
			SELECT r.*, 
				   b.user_id as reviewer_id,
				   u.full_name as reviewer_name,
				   u.avatar as reviewer_avatar
			FROM Reviews r
			JOIN Bookings b ON r.booking_id = b.id
			JOIN Tours t ON b.tour_id = t.id
			JOIN Users u ON b.user_id = u.id
			WHERE t.id = ?
		`;
		try {
			return database.executeQuery(sql, [tourId]);
		} catch (error) {
			throw error;
		}
	}

	static async findByTourId(tourId) {
		const sql = `
            SELECT r.*, 
                   b.user_id as reviewer_id,
                   u.full_name as reviewer_name,
                   u.avatar as reviewer_avatar,
                   b.tour_id
            FROM Reviews r
            JOIN Bookings b ON r.booking_id = b.id
            JOIN Users u ON b.user_id = u.id
            WHERE b.tour_id = ?
            ORDER BY r.created_at DESC
        `;
		try {
			const [reviews] = await database.executeQuery(sql, [tourId]);
			return reviews;
		} catch (error) {
			throw error;
		}
	}

	static async findByGuideId(guideId) {
		const sql = `
            SELECT r.*, 
                   b.user_id as reviewer_id,
                   u.full_name as reviewer_name,
                   u.avatar as reviewer_avatar,
                   t.title as tour_name
            FROM Reviews r
            JOIN Bookings b ON r.booking_id = b.id
            JOIN Tours t ON b.tour_id = t.id
            JOIN Users u ON b.user_id = u.id
            WHERE t.guide_id = ?
            ORDER BY r.created_at DESC
        `;
		try {
			const [reviews] = await database.executeQuery(sql, [guideId]);
			return reviews;
		} catch (error) {
			throw error;
		}
	}

	static async updateAverageRatings(bookingId) {
		const updateGuideRating = `
            UPDATE guides g
            JOIN Tours t ON g.id = t.guide_id
            JOIN Bookings b ON t.id = b.tour_id
            JOIN Reviews r ON b.id = r.booking_id
            SET g.rating = (
                SELECT AVG(rating)
                FROM Reviews r2
                JOIN Bookings b2 ON r2.booking_id = b2.id
                JOIN Tours t2 ON b2.tour_id = t2.id
                WHERE t2.guide_id = g.id
            )
            WHERE b.id = ?
        `;

		try {
			await database.executeQuery(updateGuideRating, [bookingId]);
		} catch (error) {
			throw error;
		}
	}
}

module.exports = Review;