const database = require("../configs/database");

class TourSchedule {
    constructor() {
        this.id = null;
        this.tour_id = null;
        this.day_number = null;
        this.summary = null;
    }

    static get tableName() {
        return 'Tour_Scheduless';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['tour_id', 'day_number', 'summary'],
            properties: {
                id: { type: 'integer' },
                tour_id: { type: 'integer' },
                day_number: { type: 'string' },
                summary: { type: 'string' },
            },
        };
    }

    static get relationMappings() {
        const Tour = require('./tour.model');
        return {
            tour: {
                relation: Model.BelongsToOneRelation,
                modelClass: Tour,
                join: {
                    from: 'Tour_Schedules.tour_id',
                    to: 'tour.id',
                },
            },
        };
    }

    static async findAll() {
        const sql = 'SELECT * FROM Tour_Schedules';
        try {
            const schedules = await database.executeQuery(sql);
            return schedules;
        } catch (error) {
            throw error;
        }
    }

    static async findByTourId(tourId) {
        const sql = 'SELECT * FROM Tour_Schedules WHERE tour_id = ?';
        try {
            const schedules = await database.executeQuery(sql, [tourId]);
            return schedules;
        } catch (error) {
            throw error;
        }
    }

    static async createTourSchedule(tourScheduleData) {
        const sql = 'INSERT INTO Tour_Schedules (tour_id, day_number, summary) VALUES (?, ?, ?)';
        try {
            const schedule = await database.executeQuery(sql, [tourScheduleData.tour_id, tourScheduleData.day_number, tourScheduleData.summary]);
            return schedule.insertId;
        } catch (error) {
            throw error;
        }
    }


    static async getTourSchedulesByTourId(tourId) {
        const sql = 'SELECT * FROM Tour_Schedules WHERE tour_id = ?';
        try {
            const [rows] = await database.executeQuery(sql, [tourId]);
            return rows;
        } catch (error) {
            throw error;
        }
    }


    static async save(tourId, dayNumber, summary) {
        const sql = 'INSERT INTO Tour_Schedules (tour_id, day_number, summary) VALUES (?, ?, ?)';
        try {
            await database.executeQuery(sql, [tourId, dayNumber, summary]);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = TourSchedule;