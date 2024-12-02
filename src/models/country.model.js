const database = require("../configs/database");

class Country { 
    constructor(id, name, code, continent) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.continent = continent;
    }

    static get tableName() {
        return 'Countries';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['name', 'code', 'continent'],
            properties: {
                id: { type: 'integer' },
                name: { type: 'string' },
                code: { type: 'string' },
                continent: { type: 'string' },
            },
        };
    }

    static async addCountry(name, code, continent) {
        const country = new Country(null, name, code, continent);
        return await country.save();
    }

    async save() {
        const sql = 'INSERT INTO Countries (name, code, continent) VALUES (?, ?, ?)';
        try {
            const [result] = await database.executeQuery(sql, [this.name, this.code, this.continent]);
            this.id = result.insertId;
            return this;
        } catch (error) {
            throw error;
        }
    }

    static async findAll() {
        const sql = 'SELECT * FROM Countries';
        try {
            const countries = await database.executeQuery(sql);
            return countries;
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        const sql = 'SELECT * FROM Countries WHERE id = ?';
        try {
            const [country] = await database.executeQuery(sql, [id]);
            return country;
        } catch (error) {
            throw error;
        }
    }

    static async deleteById(id) {
        const sql = 'DELETE FROM Countries WHERE id = ?';
        try {
            await database.executeQuery(sql, [id]);
        } catch (error) {
            throw error;
        }
    }

}

module.exports = Country;