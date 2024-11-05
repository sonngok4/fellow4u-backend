// models/review.model.js
class Review {
	static async create(reviewData) {
		const sql = `
            INSERT INTO reviews (
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

	static async findByBookingId(bookingId) {
		const sql = `
            SELECT r.*, 
                   b.user_id as reviewer_id,
                   u.full_name as reviewer_name,
                   u.avatar as reviewer_avatar
            FROM reviews r
            JOIN bookings b ON r.booking_id = b.id
            JOIN users u ON b.user_id = u.id
            WHERE r.booking_id = ?
        `;
		try {
			const [reviews] = await database.executeQuery(sql, [bookingId]);
			return reviews[0];
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
            FROM reviews r
            JOIN bookings b ON r.booking_id = b.id
            JOIN users u ON b.user_id = u.id
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
            FROM reviews r
            JOIN bookings b ON r.booking_id = b.id
            JOIN tours t ON b.tour_id = t.id
            JOIN users u ON b.user_id = u.id
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
            JOIN tours t ON g.id = t.guide_id
            JOIN bookings b ON t.id = b.tour_id
            JOIN reviews r ON b.id = r.booking_id
            SET g.rating = (
                SELECT AVG(rating)
                FROM reviews r2
                JOIN bookings b2 ON r2.booking_id = b2.id
                JOIN tours t2 ON b2.tour_id = t2.id
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