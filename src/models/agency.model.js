// models/agency.model.js
class Agency {
	static async create(agencyData) {
		const sql = `
            INSERT INTO agencies (
                user_id, company_name, license_number, description,
                address, website, employee_count, established_year,
                specialties, service_areas, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;
		const params = [
			agencyData.user_id,
			agencyData.company_name,
			agencyData.license_number,
			agencyData.description,
			agencyData.address,
			agencyData.website || null,
			agencyData.employee_count,
			agencyData.established_year,
			JSON.stringify(agencyData.specialties),
			JSON.stringify(agencyData.service_areas),
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
            SELECT a.*, u.email, u.phone_number, u.avatar
            FROM agencies a
            JOIN users u ON a.user_id = u.id
            WHERE a.id = ?
        `;
		try {
			const [agencies] = await database.executeQuery(sql, [id]);
			return agencies[0];
		} catch (error) {
			throw error;
		}
	}

	static async findByUserId(userId) {
		const sql = `
            SELECT a.*, u.email, u.phone_number, u.avatar
            FROM agencies a
            JOIN users u ON a.user_id = u.id
            WHERE a.user_id = ?
        `;
		try {
			const [agencies] = await database.executeQuery(sql, [userId]);
			return agencies[0];
		} catch (error) {
			throw error;
		}
	}

	static async update(id, agencyData) {
		const sql = `
            UPDATE agencies
            SET 
                company_name = ?,
                license_number = ?,
                description = ?,
                address = ?,
                website = ?,
                employee_count = ?,
                established_year = ?,
                specialties = ?,
                service_areas = ?,
                updated_at = NOW()
            WHERE id = ?
        `;
		const params = [
			agencyData.company_name,
			agencyData.license_number,
			agencyData.description,
			agencyData.address,
			agencyData.website,
			agencyData.employee_count,
			agencyData.established_year,
			JSON.stringify(agencyData.specialties),
			JSON.stringify(agencyData.service_areas),
			id,
		];

		try {
			const [result] = await database.executeQuery(sql, params);
			return result.affectedRows > 0;
		} catch (error) {
			throw error;
		}
	}
}

module.exports = Agency;