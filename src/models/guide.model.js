class Guide {
    static async create(guideData) {
        const sql = `
            INSERT INTO guides (
                user_id, description, experience_years, 
                languages, specialties, price_per_day,
                availability, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        // Data validation
        if (!guideData.user_id) {
            throw new Error('User ID is required');
        }

        // Normalize and validate price
        const price = parseFloat(guideData.price_per_day);
        if (isNaN(price) || price <= 0) {
            throw new Error('Invalid price per day');
        }

        // Ensure languages and specialties are arrays before stringifying
        const languages = Array.isArray(guideData.languages)
            ? guideData.languages
            : guideData.languages?.split(',').map(lang => lang.trim()).filter(Boolean) || [];

        const specialties = Array.isArray(guideData.specialties)
            ? guideData.specialties
            : guideData.specialties?.split(',').map(spec => spec.trim()).filter(Boolean) || [];

        // Validate arrays are not empty
        if (languages.length === 0) {
            throw new Error('At least one language is required');
        }

        if (specialties.length === 0) {
            throw new Error('At least one specialty is required');
        }

        const params = [
            guideData.user_id,
            guideData.description?.trim() || null,
            guideData.experience_years || 0,
            JSON.stringify(languages),
            JSON.stringify(specialties),
            price,
            (guideData.availability || 'available').toLowerCase(),
        ];

        try {
            const [result] = await database.executeQuery(sql, params);
            return result.insertId;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('A guide profile already exists for this user');
            }
            throw error;
        }
    }

    static async formatGuideData(guide) {
        if (!guide) return null;
        
        try {
            return {
                ...guide,
                languages: JSON.parse(guide.languages || '[]'),
                specialties: JSON.parse(guide.specialties || '[]'),
                price_per_day: parseFloat(guide.price_per_day),
                experience_years: parseInt(guide.experience_years, 10)
            };
        } catch (error) {
            console.error('Error formatting guide data:', error);
            return guide; // Return original data if parsing fails
        }
    }

    static async findByUserId(userId) {
        const sql = `
            SELECT 
                g.*,
                u.full_name,
                u.email,
                u.phone_number,
                u.avatar,
                COALESCE(AVG(r.rating), 0) as average_rating,
                COUNT(r.id) as review_count
            FROM guides g
            JOIN users u ON g.user_id = u.id
            LEFT JOIN reviews r ON g.id = r.guide_id
            WHERE g.user_id = ?
            GROUP BY g.id
        `;
        
        try {
            const [guides] = await database.executeQuery(sql, [userId]);
            if (guides.length === 0) return null;
            
            return this.formatGuideData(guides[0]);
        } catch (error) {
            throw error;
        }
    }

    // Additional useful methods
    static async updateAvailability(guideId, availability) {
        const sql = `
            UPDATE guides 
            SET availability = ?, updated_at = NOW() 
            WHERE id = ?
        `;
        
        try {
            const [result] = await database.executeQuery(sql, [
                availability.toLowerCase(),
                guideId
            ]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async updatePricing(guideId, pricePerDay) {
        const price = parseFloat(pricePerDay);
        if (isNaN(price) || price <= 0) {
            throw new Error('Invalid price per day');
        }

        const sql = `
            UPDATE guides 
            SET price_per_day = ?, updated_at = NOW() 
            WHERE id = ?
        `;
        
        try {
            const [result] = await database.executeQuery(sql, [price, guideId]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async search(filters = {}) {
        let sql = `
            SELECT 
                g.*,
                u.full_name,
                u.avatar,
                COALESCE(AVG(r.rating), 0) as average_rating,
                COUNT(r.id) as review_count
            FROM guides g
            JOIN users u ON g.user_id = u.id
            LEFT JOIN reviews r ON g.id = r.guide_id
            WHERE g.availability = 'available'
        `;
        
        const params = [];

        if (filters.minPrice) {
            sql += ` AND g.price_per_day >= ?`;
            params.push(parseFloat(filters.minPrice));
        }

        if (filters.maxPrice) {
            sql += ` AND g.price_per_day <= ?`;
            params.push(parseFloat(filters.maxPrice));
        }

        if (filters.minExperience) {
            sql += ` AND g.experience_years >= ?`;
            params.push(parseInt(filters.minExperience));
        }

        sql += ` GROUP BY g.id`;

        if (filters.minRating) {
            sql += ` HAVING average_rating >= ?`;
            params.push(parseFloat(filters.minRating));
        }

        sql += ` ORDER BY average_rating DESC, review_count DESC`;

        try {
            const [guides] = await database.executeQuery(sql, params);
            return Promise.all(guides.map(guide => this.formatGuideData(guide)));
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Guide;