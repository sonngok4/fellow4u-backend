// routes/upload.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { cloudinary } = require('../configs/cloudinary');
const TourImage = require('../models/tourImage.model');
const { log } = require('winston');

// Cấu hình multer để xử lý file upload
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // giới hạn 5MB
        files: 10 // giới hạn tối đa 10 files
    },
});

router.post('/upload-single', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Convert buffer to base64
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(dataURI, {
            resource_type: 'auto',
            folder: 'tour_images',
        });
        // console.log(result);

        await TourImage.insert({
            tourId: 1,
            url: result.url
        });

        res.json({
            url: result.url,
            publicId: result.public_id
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

router.post('/upload-multiple', upload.array('images', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded'
            });
        }

        const uploadPromises = req.files.map(async (file) => {
            // Convert buffer to base64
            const b64 = Buffer.from(file.buffer).toString('base64');
            const dataURI = `data:${file.mimetype};base64,${b64}`;

            // Upload to Cloudinary
            try {
                const result = await cloudinary.uploader.upload(dataURI, {
                    resource_type: 'auto',
                    folder: 'tour_images',
                });

                // Trả về thông tin cần thiết cho mỗi file
                return {
                    originalName: file.originalname,
                    url: result.secure_url,
                    publicId: result.public_id,
                    size: result.bytes,
                    format: result.format
                };
            } catch (error) {
                console.error(`Error uploading file ${file.originalname}:`, error);
                return {
                    originalName: file.originalname,
                    error: 'Upload failed'
                };
            }
        });

        // Đợi tất cả các file upload xong
        const results = await Promise.all(uploadPromises);

        // Lọc ra các file upload thành công và thất bại
        const successful = results.filter(r => !r.error);
        console.log('successful', successful);

        const failed = results.filter(r => r.error);
        // Lưu vào database
        if (successful.length > 0) {
            await TourImage.insertMany(successful.map(s => ({ tourId: 1, url: s.url })));
        }

        res.json({
            success: true,
            uploaded: successful,
            failed: failed,
            totalSuccess: successful.length,
            totalFailed: failed.length
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Upload failed',
            error: error.message
        });
    }
});


module.exports = router;
