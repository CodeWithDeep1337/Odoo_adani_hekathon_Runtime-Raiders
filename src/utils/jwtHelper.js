/**
 * JWT Utility Functions
 * Token generation and verification
 */

const jwt = require('jsonwebtoken');
const config = require('../config/env');

/**
 * Generate access token
 */
const generateAccessToken = (userData) => {
  return jwt.sign(userData, config.JWT_ACCESS_SECRET, {
    expiresIn: config.JWT_ACCESS_EXPIRY,
  });
};

/**
 * Generate refresh token
 */
const generateRefreshToken = (userData) => {
  return jwt.sign(userData, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRY,
  });
};

/**
 * Generate token pair
 */
const generateTokenPair = (userData) => {
  const accessToken = generateAccessToken(userData);
  const refreshToken = generateRefreshToken(userData);

  return {
    accessToken,
    refreshToken,
    expiresIn: config.JWT_ACCESS_EXPIRY,
  };
};

/**
 * Verify access token
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.JWT_ACCESS_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Verify refresh token
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, config.JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Decode token without verification
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
};
