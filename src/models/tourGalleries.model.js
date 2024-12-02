const { cloudinary } = require("../configs/cloudinary");
const database = require("../configs/database");

class TourGalleries {
    constructor(id, tourId, public_id, image_url) {
        this.id = id;
        this.tourId = tourId;
        this.public_id = public_id;
        this.image_url = image_url;
    }

    static async createTourGallery(tourGalleriesData) {
        const sql = 'INSERT INTO Tour_Galleries_Photo (tour_id, public_id, image_url) VALUES (?, ?, ?)';
        try {
            await database.executeQuery(sql, [tourGalleriesData.tour_id, tourGalleriesData.public_id, tourGalleriesData.image_url]);
        } catch (error) {
            throw error;
        }
    }

    // insert photo
    static async insert(image) {
        const sql = 'INSERT INTO Tour_Galleries_Photo (tour_id, public_id, image_url) VALUES (?, ?, ?)';
        try {
            await database.executeQuery(sql, [image.tourId, image.public_id, image.image_url]);
        } catch (error) {
            throw error;
        }
    }

    // insert many photo
    static async insertMany(images) {
        const placeholders = images.map(() => '(?, ?, ?)').join(', ');
        const values = images.flatMap(image => [image.tourId, image.public_id, image.image_url]);
        const sql = `INSERT INTO Tour_Galleries_Photo (tour_id, public_id, image_url) VALUES ${placeholders}`;
        try {
            await database.executeQuery(sql, values);
        } catch (error) {
            throw error;
        }
    }

    // find by tour id
    static async findByTourId(tourId) {
        const sql = 'SELECT * FROM Tour_Galleries_Photo WHERE tour_id = ?';
        try {
            const images = await database.executeQuery(sql, [tourId]);
            return images;
        } catch (error) {
            throw error;
        }
    }

    // delete by tour id
    static async deleteByTourId(tourId) {
        const result = await this.findByTourId(tourId);
        const sql = 'DELETE FROM Tour_Galleries_Photo WHERE tour_id = ?';
        try {
            await database.executeQuery(sql, [tourId]);
            const public_ids = result.map(image => image.public_id);
            await cloudinary.api.delete_resources(public_ids);
        } catch (error) {
            throw error;
        }
    }


}

module.exports = TourGalleries;