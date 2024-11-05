// utils/password.util.js
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const hashPassword = async password => {
	const salt = await bcrypt.genSalt(10);
	return bcrypt.hash(password, salt);
};

const comparePassword = async (password, hashedPassword) => {
	return bcrypt.compare(password, hashedPassword);
};

const generateResetToken = () => {
	return crypto.randomBytes(32).toString('hex');
};

const generateVerificationCode = (length = 6) => {
	return Math.floor(Math.random() * Math.pow(10, length))
		.toString()
		.padStart(length, '0');
};

const hashToken = token => {
	return crypto.createHash('sha256').update(token).digest('hex');
};

class PasswordUtil {
	static hashPassword = hashPassword;

	static comparePassword = comparePassword;

	static generateResetToken = generateResetToken;

	static generateVerificationCode = generateVerificationCode;

	static hashToken = hashToken;
}

module.exports = {
	PasswordUtil,
	hashPassword,
	comparePassword,
	generateResetToken,
	generateVerificationCode,
	hashToken,
};
