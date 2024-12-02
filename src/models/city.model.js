const database = require("../configs/database");

class City {
    constructor(id, country_id, name, latitude, longitude) {
        this.id = id;
        this.country_id = country_id;
        this.name = name;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    static get tableName() {
        return 'Cities';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['name', 'country'],
            properties: {
                id: { type: 'integer' },
                country_id: { type: 'integer' },
                latitude: { type: 'number' },
                longitude: { type: 'number' },
                name: { type: 'string' },
            },
        };
    }

    static async addCity(country_id, name, latitude, longitude) {
        const city = new City(null, country_id, name, latitude, longitude);
        return await city.save();
    }

    async save() {
        const sql = 'INSERT INTO Cities (country_id, name, latitude, longitude) VALUES (?, ?, ?, ?)';
        try {
            const [result] = await database.executeQuery(sql, [this.country_id, this.name, this.latitude, this.longitude]);
            this.id = result.insertId;
            return this;
        } catch (error) {
            throw error;
        }
    }

    static async findAll() {
        const sql = 'SELECT * FROM Cities';
        try {
            const [rows] = await database.executeQuery(sql);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) { 
        const sql = 'SELECT * FROM Cities WHERE id = ?';
        try {
            const [city] = await database.executeQuery(sql, [id]);
            return city;
        } catch (error) {
            throw error;
        }
    }

}

module.exports = City;