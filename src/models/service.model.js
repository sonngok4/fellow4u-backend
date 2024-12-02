const database = require("../configs/database");

class Service {
    constructor() {
        this.id = null;
        this.name = null;
        this.included_services = null;
        this.excluded_services = null;
        this.transportation_details = null;
        this.description = null;
    }

    static async addService(name, included_services, excluded_services, transportation_details, description) {
        const service = new Service(null, name, included_services, excluded_services, transportation_details, description);
        return await service.save();
    }

    async save() {
        const sql = 'INSERT INTO Services (name, included_services, excluded_services, transportation_details, description) VALUES (?, ?, ?, ?, ?)';
        try {
            const [result] = await database.executeQuery(sql, [this.name, this.included_services, this.excluded_services, this.transportation_details, this.description]);
            this.id = result.insertId;
            return this;
        } catch (error) {
            throw error;
        }
    }

    static async findAll() {
        const sql = 'SELECT * FROM Services';
        try {
            const services = await database.executeQuery(sql);
            return services;
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        const sql = 'SELECT * FROM Services WHERE id = ?';
        try {
            const [service] = await database.executeQuery(sql, [id]);
            return service;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Service;