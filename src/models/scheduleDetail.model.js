const database = require("../configs/database");

class ScheduleDetail {
    constructor(id, scheduleId, time, activity) {
        this.id = id;
        this.scheduleId = scheduleId;
        this.time = time;
        this.activity = activity;
    }

    static tableName() {
        return 'Schedule_Details';
    }

    static jsonSchema() {
        return {
            type: 'object',
            required: ['scheduleId', 'time', 'activity'],
            properties: {
                id: { type: 'integer' },
                scheduleId: { type: 'integer' },
                time: { type: 'string' },
                activity: { type: 'string' },
            },
        };
    }

    static get relationMappings() {
        const Schedule = require('./schedule.model');
        return {
            schedule: {
                relation: Schedule.BelongsToOneRelation,
                modelClass: Schedule,
                join: {
                    from: 'Schedule_Details.scheduleId',
                    to: 'Schedules.id',
                },
            },
        };
    }

    static async findByScheduleId(scheduleId) {
        const sql = 'SELECT * FROM Schedule_Details WHERE scheduleId = ?';
        try {
            const schedules = await database.executeQuery(sql, [scheduleId]);
            return schedules;
        } catch (error) {
            throw error;
        }
    }

    static async createScheduleDetail(ScheduleDetailsData) {
        const sql = 'INSERT INTO Schedule_Details (schedule_id, time, activity) VALUES (?, ?, ?)';
        try {
            const schedule_detail = await database.executeQuery(sql, [ScheduleDetailsData.schedule_id, ScheduleDetailsData.time, ScheduleDetailsData.activity]);
            return schedule_detail.insertId;
        } catch (error) {
            throw error;
        }
    }

    static async save(scheduleId, time, activity) {
        const sql = 'INSERT INTO Schedule_Details (scheduleId, time, activity) VALUES (?, ?, ?)';
        try {
            await database.executeQuery(sql, [scheduleId, time, activity]);
        } catch (error) {
            throw error;
        }
    }


}

module.exports = ScheduleDetail;