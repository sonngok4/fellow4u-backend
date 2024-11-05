// upload.service.js
const AWS = require('aws-sdk');
const UploadUtil = require('../utils/upload.util');
const Logger = require('../utils/logger.util');

class UploadService {
	constructor() {
		this.s3 = new AWS.S3({
			accessKeyId: process.env.AWS_ACCESS_KEY,
			secretAccessKey: process.env.AWS_SECRET_KEY,
			region: process.env.AWS_REGION,
		});
		this.bucket = process.env.AWS_BUCKET;
	}

	async uploadFile(file, folder) {
		try {
			const fileName = UploadUtil.generateFileName(file.originalname);
			const params = {
				Bucket: this.bucket,
				Key: `${folder}/${fileName}`,
				Body: file.buffer,
				ContentType: file.mimetype,
				ACL: 'public-read',
			};

			const result = await this.s3.upload(params).promise();
			Logger.info(`File uploaded successfully: ${result.Location}`);
			return result.Location;
		} catch (error) {
			Logger.error('Error uploading file:', error);
			throw error;
		}
	}

	async deleteFile(fileUrl) {
		try {
			const key = fileUrl.split('/').slice(-2).join('/');
			const params = {
				Bucket: this.bucket,
				Key: key,
			};

			await this.s3.deleteObject(params).promise();
			Logger.info(`File deleted successfully: ${fileUrl}`);
		} catch (error) {
			Logger.error('Error deleting file:', error);
			throw error;
		}
	}
}

module.exports = UploadService;