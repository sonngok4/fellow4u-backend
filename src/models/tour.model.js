// models/tour.model.js
class Tour {
	static async create(tourData) {
		const sql = `
            INSERT INTO tours (
                guide_id, title, description, destination,
                duration_days, max_participants, price_per_person,
                included_services, excluded_services, status,
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;
		const params = [
			tourData.guide_id,
			tourData.title,
			tourData.description,
			tourData.destination,
			tourData.duration_days,
			tourData.max_participants,
			tourData.price_per_person,
			JSON.stringify(tourData.included_services),
			JSON.stringify(tourData.excluded_services),
			tourData.status || 'active',
		];

		try {
			const [result] = await database.executeQuery(sql, params);
			return result.insertId;
		} catch (error) {
			throw error;
		}
	}

	static async findById(id) {
		const sql = `
            SELECT t.*, g.user_id as guide_user_id, u.full_name as guide_name, u.avatar as guide_avatar
            FROM tours t
            JOIN guides g ON t.guide_id = g.id
            JOIN users u ON g.user_id = u.id
            WHERE t.id = ?
        `;
		try {
			const [tours] = await database.executeQuery(sql, [id]);
			return tours[0];
		} catch (error) {
			throw error;
		}
	}
}

module.exports = Tour;