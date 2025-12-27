/**
 * Crypto Utility Functions
 * Password hashing and OTP generation
 */

const bcryptjs = require('bcryptjs');
const config = require('../config/env');

/**
 * Hash password
 */
const hashPassword = async (password) => {
  const salt = await bcryptjs.genSalt(config.BCRYPT_ROUNDS);
  return bcryptjs.hash(password, salt);
};

/**
 * Compare password
 */
const comparePassword = async (password, hash) => {
  return bcryptjs.compare(password, hash);
};

/**
 * Generate OTP
 */
const generateOTP = () => {
  let otp = '';
  for (let i = 0; i < config.OTP_LENGTH; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
};

/**
 * Hash OTP
 */
const hashOTP = async (otp) => {
  const salt = await bcryptjs.genSalt(config.BCRYPT_ROUNDS);
  return bcryptjs.hash(otp, salt);
};

/**
 * Verify OTP
 */
const verifyOTP = async (otp, hash) => {
  return bcryptjs.compare(otp, hash);
};

/**
 * Generate secure random token
 */
const generateRandomToken = (length = 32) => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

module.exports = {
  hashPassword,
  comparePassword,
  generateOTP,
  hashOTP,
  verifyOTP,
  generateRandomToken,
};
