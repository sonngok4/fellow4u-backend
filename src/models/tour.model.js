// models/tour.model.js
const { cloudinary } = require('../configs/cloudinary');
const database = require('../configs/database');
class Tour {
	static async create(tourData) {
		// need a fields stored public_id of cloudinary
		const sql = `
    INSERT INTO Tours (
				agency_id,
				tour_name,
				country_id,
				city_id,
				service_id,
				itinerary,
				duration,
				departure_date,
				departure_place,
				public_id,
				cover_photo,
				description,
				price_adult,
				price_child,
				price_baby,
				status,
				created_at
				) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, NOW())`;
		const params = [
			tourData.agency_id,
			tourData.tour_name,
			tourData.country_id,
			tourData.city_id,
			tourData.service_id,
			tourData.itinerary,
			tourData.duration,
			tourData.departure_date,
			tourData.departure_place,
			tourData.cover_photo.public_id,
			tourData.cover_photo.secure_url,
			tourData.description,
			tourData.price_adult,
			tourData.price_child,
			tourData.price_baby,
			tourData.status || 'active',
		];

		try {
			const result = await database.executeQuery(sql, params);
			console.log('waiting for result', result);
			const tourId = result.insertId;

			return tourId;
		} catch (error) {
			throw error;
		}
	}

	static async update(id, tourData) {
		const sql = `
    UPDATE Tours
    SET tour_name = ?,
	country_id = ?,
	city_id = ?,
	service_id = ?,
	itinerary = ?,
	duration = ?,
	departure_date = ?,
	departure_place = ?,
	public_id = ?,
	cover_photo = ?,
	description = ?,
	price_adult = ?,
	price_child = ?,
	price_baby = ?,
	status = ?,
	updated_at = NOW()
    WHERE id = ?`;
		const params = [
			tourData.tour_name,
			tourData.country_id,
			tourData.city_id,
			tourData.service_id,
			tourData.itinerary,
			tourData.duration,
			tourData.departure_date,
			tourData.departure_place,
			public_id,
			tourData.cover_photo,
			tourData.description,
			tourData.price_adult,
			tourData.price_child,
			tourData.price_baby,
			tourData.status || 'active',
			id
		];

		try {
			// Xoá ảnh cũ và thêm ảnh mới nếu tour data có cover_photo !== null
			const [rows] = await database.executeQuery('SELECT cover_photo FROM Tours WHERE id = ?', [id]);

			if (rows.length > 0 && rows[0].cover_photo !== null) {
				await database.executeQuery('DELETE FROM Tours WHERE id = ?', [id]);
				await cloudinary.api.delete_resources([rows[0].cover_photo]);
			}

			const [result] = await database.executeQuery(sql, params);

			if (result.affectedRows === 0) {
				throw new Error('Tour not found');
			}

			return result.affectedRows > 0;
		} catch (error) {
			throw error;
		}
	}

	static async findAll() {
		// Truy vấn SQL để lấy thông tin từ các bảng
		const sql = `
    SELECT 
        t.id, 
        t.agency_id, 
        t.tour_name,
        t.country_id as country_id,
        c.name as country,
        t.city_id as city_id,
        ci.name as city, 
        t.service_id as service_id,
        s.name as service, 
        t.itinerary, 
        t.duration, 
        t.departure_date, 
        t.departure_place, 
        t.public_id, 
        t.cover_photo, 
        t.description, 
        t.price_adult, 
        t.price_child, 
        t.price_baby, 
        t.status, 
        t.created_at, 
        t.updated_at,
        GROUP_CONCAT(DISTINCT tg.image_url) as galleries,
        ts.day_number,
        ts.summary,
        sd.time,
        sd.activity
    FROM 
        Tours t
    LEFT JOIN 
        Countries c ON t.country_id = c.id
    LEFT JOIN 
        Cities ci ON t.city_id = ci.id
    LEFT JOIN 
        Services s ON t.service_id = s.id
    LEFT JOIN 
        Tour_Galleries_Photo tg ON t.id = tg.tour_id
    LEFT JOIN 
        Tour_Schedules ts ON t.id = ts.tour_id
    LEFT JOIN 
        Schedule_Details sd ON ts.id = sd.schedule_id
    GROUP BY 
        t.id, ts.day_number, sd.time
    ORDER BY 
        t.id, ts.day_number, sd.time;
    `;

		try {
			const rows = await database.executeQuery(sql); // Thực thi truy vấn

			// Sử dụng `map` để nhóm các dữ liệu vào đối tượng tour với cấu trúc mong muốn
			const tours = [];

			rows.forEach(row => {
				// Tìm hoặc tạo đối tượng tour trong mảng `tours`
				let tour = tours.find(t => t.id === row.id);

				if (!tour) {
					tour = {
						id: row.id,
						agency_id: row.agency_id,
						tour_name: row.tour_name,
						country_id: row.country_id,
						country: row.country,
						city_id: row.city_id,
						city: row.city,
						service_id: row.service_id,
						service: row.service,
						itinerary: row.itinerary,
						duration: row.duration,
						departure_date: row.departure_date,
						departure_place: row.departure_place,
						public_id: row.public_id,
						cover_photo: row.cover_photo,
						description: row.description,
						price_adult: row.price_adult,
						price_child: row.price_child,
						price_baby: row.price_baby,
						status: row.status,
						created_at: row.created_at,
						updated_at: row.updated_at,
						galleries: row.galleries ? row.galleries.split(',') : [],  // Chuyển chuỗi ảnh thành mảng
						schedules: []  // Khởi tạo mảng `schedules`
					};
					tours.push(tour);
				}

				// Tạo hoặc tìm schedule cho ngày của tour
				let schedule = tour.schedules.find(s => s.day === row.day_number);

				if (!schedule) {
					schedule = {
						day: row.day_number,
						summary: row.summary,
						activities: []
					};
					tour.schedules.push(schedule);
				}

				// Thêm activity vào schedule
				schedule.activities.push({ time: row.time, activity: row.activity });
			});

			return tours;  // Trả về dữ liệu đã nhóm theo đúng cấu trúc JSON
		} catch (error) {
			throw error;  // Xử lý lỗi
		}
	}


	static async findById(id) {
		const sql = `
        SELECT
            t.id,
            t.agency_id,
            a.company_name as agency_name,   -- Thêm cột agency_name từ bảng Agencies
            t.tour_name,
            t.country_id as country_id,
            c.name as country,
            t.city_id as city_id,
            ci.name as city,
            t.service_id as service_id,
            s.name as service,
            t.itinerary,
            t.duration,
            t.departure_date,
            t.departure_place,
            t.public_id,
            t.cover_photo,
            t.description,
            t.price_adult,
            t.price_child,
            t.price_baby,
            t.status,
            t.created_at,
            t.updated_at,
            GROUP_CONCAT(DISTINCT tg.image_url) as galleries,
            ts.day_number,
            ts.summary,
            sd.time,
            sd.activity
        FROM
            Tours t
        LEFT JOIN
            Countries c ON t.country_id = c.id
        LEFT JOIN
            Cities ci ON t.city_id = ci.id
        LEFT JOIN
            Services s ON t.service_id = s.id
        LEFT JOIN
            Tour_Galleries_Photo tg ON t.id = tg.tour_id
        LEFT JOIN
            Tour_Schedules ts ON t.id = ts.tour_id
        LEFT JOIN
            Schedule_Details sd ON ts.id = sd.schedule_id
        LEFT JOIN
            Agencies a ON t.agency_id = a.id  -- Thêm join với bảng Agencies
        WHERE
            t.id = ?
        GROUP BY
            t.id, ts.day_number, sd.time
        ORDER BY
            t.id, ts.day_number, sd.time;
    `;

		try {
			const result = await database.executeQuery(sql, [id]);

			// Định dạng lại dữ liệu
			const tourData = result.reduce((tour, row) => {
				// Nếu chưa có tour, khởi tạo nó
				if (!tour.id) {
					tour.id = row.id;
					tour.agency_id = row.agency_id;
					tour.agency_name = row.agency_name || "";  // Lấy agency_name từ kết quả truy vấn
					tour.tour_name = row.tour_name;
					tour.country = row.country;
					tour.city = row.city;
					tour.service = row.service || null; // Nếu không có dịch vụ thì để null
					tour.itinerary = row.itinerary || "";
					tour.duration = row.duration || "";
					tour.departure_date = row.departure_date || "";
					tour.departure_place = row.departure_place || "";
					tour.public_id = row.public_id || "";
					tour.cover_photo = row.cover_photo || "";
					tour.description = row.description || "";
					tour.price_adult = row.price_adult || "0.00";
					tour.price_child = row.price_child || "0.00";
					tour.price_baby = row.price_baby || "0.00";
					tour.status = row.status || "draft";
					tour.created_at = row.created_at || "";
					tour.updated_at = row.updated_at || "";
					tour.galleries = row.galleries ? row.galleries.split(',') : []; // Tách mảng galleries
					tour.schedules = []; // Khởi tạo mảng schedules rỗng
				}

				// Thêm schedule và activities
				let schedule = tour.schedules.find(s => s.day === row.day_number);

				if (!schedule) {
					schedule = {
						day: row.day_number,
						summary: row.summary || "",
						activities: []
					};
					tour.schedules.push(schedule);
				}

				// Thêm activity vào schedule
				schedule.activities.push({
					time: row.time || "",
					activity: row.activity || ""
				});

				return tour;
			}, {});

			return tourData;
		} catch (error) {
			throw error;
		}
	}
}

module.exports = Tour;