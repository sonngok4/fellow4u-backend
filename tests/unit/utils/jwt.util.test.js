// tests/unit/utils/jwt.util.test.js
const { JWTUtil } = require('../../../src/utils/jwt.util');
const jwt = require('jsonwebtoken');
const config = require('../../../src/configs/environment');

jest.mock('jsonwebtoken');
jest.mock('../../../src/configs/environment', () => ({
	JWT_SECRET: 'test-secret',
}));

describe('JWTUtil', () => {
	const mockUser = { _id: 'user123', email: 'test@example.com' };
	const mockToken = 'mock.jwt.token';

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should generate token successfully', () => {
		jwt.sign.mockReturnValue(mockToken);

		const token = JWTUtil.generateToken(mockUser);

		expect(token).toBe(mockToken);
		expect(jwt.sign).toHaveBeenCalledWith(
			{ userId: mockUser._id },
			config.JWT_SECRET,
			{ expiresIn: '1d' },
		);
	});

	it('should verify token successfully', () => {
		const mockDecodedToken = { userId: 'user123' };
		jwt.verify.mockReturnValue(mockDecodedToken);

		const decoded = JWTUtil.verifyToken(mockToken);

		expect(decoded).toEqual(mockDecodedToken);
		expect(jwt.verify).toHaveBeenCalledWith(mockToken, config.JWT_SECRET);
	});

	it('should generate refresh token successfully', () => {
		jwt.sign.mockReturnValue(mockToken);

		const token = JWTUtil.generateRefreshToken(mockUser);

		expect(token).toBe(mockToken);
		expect(jwt.sign).toHaveBeenCalledWith(
			{ userId: mockUser._id },
			config.JWT_SECRET,
			{ expiresIn: '7d' },
		);
	});

	it('should verify refresh token successfully', () => {
		const mockDecodedToken = { userId: 'user123' };
		jwt.verify.mockReturnValue(mockDecodedToken);

		const decoded = JWTUtil.verifyRefreshToken(mockToken);

		expect(decoded).toEqual(mockDecodedToken);
		expect(jwt.verify).toHaveBeenCalledWith(mockToken, config.JWT_SECRET);
	});

	it('should decode token successfully', () => {
		const mockDecodedToken = { userId: 'user123' };
		jwt.decode.mockReturnValue(mockDecodedToken);

		const decoded = JWTUtil.decodeToken(mockToken);

		expect(decoded).toEqual(mockDecodedToken);
		expect(jwt.decode).toHaveBeenCalledWith(mockToken);
	});
});
