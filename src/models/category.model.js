
const database = require("../configs/database");



class Category {

    constructor(id, name, description, icon) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.icon = icon;
    }

    static async addCategory(name, description, icon) {
        const category = new Category(null, name, description, icon);
        return await category.save();
    }

    async save() {
        const sql = 'INSERT INTO Categories (name, description, icon) VALUES (?, ?, ?)';
        try {
            const [result] = await database.executeQuery(sql, [this.name, this.description, this.icon]);
            this.id = result.insertId;
            return this;
        } catch (error) {
            throw error;
        }
    }

    static async findAll() {
        const sql = 'SELECT * FROM Categories';
        try {
            const categories = await database.executeQuery(sql);
            return categories;
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        const sql = 'SELECT * FROM Categories WHERE id = ?';
        try {
            const [category] = await database.executeQuery(sql, [id]);
            return category;
        } catch (error) {
            throw error;
        }
    }


}

module.exports = Category;