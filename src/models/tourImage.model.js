// models/tourImage.model.js
const database = require('../configs/database');

class TourImage {
    constructor(id, tourId, url) {
        this.id = id;
        this.tourId = tourId;
        this.url = url;
    }


    static async insert(image) {
        const sql = 'INSERT INTO TourImages (tour_id, image_url) VALUES (?, ?)';
        try {
            await database.executeQuery(sql, [image.tourId, image.url]);
        } catch (error) {
            throw error;
        }
    }



    static async insertMany(images) {
        const placeholders = images.map(() => '(?, ?)').join(', ');
        const values = images.flatMap(image => [image.tourId, image.url]);

        const sql = `INSERT INTO TourImages (tour_id, image_url) VALUES ${placeholders}`;

        try {
            await database.executeQuery(sql, values);
        } catch (error) {
            throw error;
        }
    }

    static async findByTourId(tourId) {
        const sql = 'SELECT * FROM TourImages WHERE tour_id = ?';
        try {
            const [images] = await database.executeQuery(sql, [tourId]);
            return images;
        } catch (error) {
            throw error;
        }
    }

    static async deleteByTourId(tourId) {
        const sql = 'DELETE FROM TourImages WHERE tour_id = ?'; 
        try {
            await database.executeQuery(sql, [tourId]);
        } catch (error) {
            throw error;
        }
    }

    static async save(url, tourId) {
        const sql = 'INSERT INTO TourImages (tour_id, image_url) VALUES (?, ?)';
        try {
            await database.executeQuery(sql, [tourId, url]);
        } catch (error) {
            throw error;
        }
    }

}

module.exports = TourImage;