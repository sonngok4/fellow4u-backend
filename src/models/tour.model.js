// models/tour.model.js
const database = require('../configs/database');
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
			tourData.status || 'active'
		];

		try {
			const [result] = await database.executeQuery(sql, params);
			const tourId = result.insertId;

			// Thêm ảnh của tour
			if (tourData.images && tourData.images.length > 0) {
				const imagesSql = `
        INSERT INTO tour_images (tour_id, image_url)
        VALUES ?
      `;
				const imagesParams = tourData.images.map(imageUrl => [tourId, imageUrl]);
				await database.executeQuery(imagesSql, [imagesParams]);
			}

			return tourId;
		} catch (error) {
			throw error;
		}
	}

	static async update(id, tourData) {
		const sql = `
    UPDATE tours
    SET title = ?, description = ?, destination = ?, duration_days = ?, 
    max_participants = ?, price_per_person = ?, included_services = ?, 
    excluded_services = ?, status = ?, updated_at = NOW()
    WHERE id = ?
  `;
		const params = [
			tourData.title,
			tourData.description,
			tourData.destination,
			tourData.duration_days,
			tourData.max_participants,
			tourData.price_per_person,
			JSON.stringify(tourData.included_services),
			JSON.stringify(tourData.excluded_services),
			tourData.status || 'active',
			id
		];

		try {
			const [result] = await database.executeQuery(sql, params);

			// Xóa các ảnh cũ và thêm ảnh mới
			await database.executeQuery(`DELETE FROM tour_images WHERE tour_id = ?`, [id]);
			if (tourData.images && tourData.images.length > 0) {
				const imagesSql = `
        INSERT INTO tour_images (tour_id, image_url)
        VALUES ?
      `;
				const imagesParams = tourData.images.map(imageUrl => [id, imageUrl]);
				await database.executeQuery(imagesSql, [imagesParams]);
			}

			return result.affectedRows > 0;
		} catch (error) {
			throw error;
		}
	}

	static async findAll() {
		const sql = `
    SELECT 
      t.*,
      g.user_id as guide_user_id, 
      u.full_name as guide_name, 
      u.avatar as guide_avatar,
      JSON_ARRAYAGG(i.image_url) as images
    FROM tours t
    JOIN guides g ON t.guide_id = g.id
    JOIN users u ON g.user_id = u.id
    LEFT JOIN tour_images i ON t.id = i.tour_id
    GROUP BY t.id
  `;
		try {
			const tours = await database.executeQuery(sql);
			return tours.map(tour => ({
				...tour,
				included_services: JSON.parse(tour.included_services),
				excluded_services: JSON.parse(tour.excluded_services),
				images: tour.images ? JSON.parse(tour.images) : [],
			}));
		} catch (error) {
			throw error;
		}
	}

	static async findById(id) {
		const sql = `
    SELECT 
      t.*,
      g.user_id as guide_user_id, 
      u.full_name as guide_name, 
      u.avatar as guide_avatar,
      JSON_ARRAYAGG(i.image_url) as images
    FROM tours t
    JOIN guides g ON t.guide_id = g.id
    JOIN users u ON g.user_id = u.id
    LEFT JOIN tour_images i ON t.id = i.tour_id
    WHERE t.id = ?
    GROUP BY t.id
  `;
		try {
			const tour = await database.executeQuery(sql, [id]);
			return tour.map(tour => ({
				...tour,
				included_services: JSON.parse(tour.included_services),
				excluded_services: JSON.parse(tour.excluded_services),
				images: tour.images ? JSON.parse(tour.images) : [],
			}));
		} catch (error) {
			throw error;
		}
	}
}

module.exports = Tour;