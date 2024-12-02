const database = require("../configs/database");

class TourCategory {
    static get relationMappings() {
        const Tour = require('./tour.model');
        return {
            tour: {
                relation: Model.BelongsToOneRelation,
                modelClass: Tour,
                join: {
                    from: 'Tour_Categories.tour_id',
                    to: 'tour.id',
                },
            },
        };
    }

    static async findAll() {
        const sql = `SELECT * FROM Tour_Categories`;
        try {
            const tourCategories = await database.executeQuery(sql);
            return tourCategories.map(tourCategory => ({
                ...tourCategory,
            }));
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        const sql = `SELECT * FROM Tour_Categories WHERE id = ?`;
        try {
            const [tourCategory] = await database.executeQuery(sql, [id]);
            return tourCategory;
        } catch (error) {
            throw error;
        }
    }

    static async create(tourCategoryData) {
        const sql = `INSERT INTO Tour_Categories (tour_id, category_id) VALUES (?, ?)`;
        try {
            const tourCategory = await database.executeQuery(sql, [tourCategoryData.tour_id, tourCategoryData.category_id]);
            return tourCategory;
        } catch (error) {
            throw error;
        }
    }
    
}

module.exports = TourCategory;