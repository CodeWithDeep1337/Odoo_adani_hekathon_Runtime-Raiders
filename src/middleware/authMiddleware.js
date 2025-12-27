/**
 * Authentication Middleware
 * JWT verification and authorization
 */

const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { ApiError, asyncHandler } = require('./errorHandler');

/**
 * Verify access token middleware
 */
const authMiddleware = asyncHandler(async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new ApiError('No token provided', 401);
    }

    const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ApiError('Token expired', 401);
    }
    throw new ApiError('Invalid token', 401);
  }
});

/**
 * Role-based access control middleware
 */
const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError('User not authenticated', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(
        `Access denied. Required roles: ${allowedRoles.join(', ')}`,
        403
      );
    }

    next();
  };
};

/**
 * Optional auth middleware (doesn't fail if no token)
 */
const optionalAuthMiddleware = asyncHandler(async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET);
      req.user = decoded;
    }
  } catch (error) {
    // Continue without user
  }

  next();
});

module.exports = {
  authMiddleware,
  roleMiddleware,
  optionalAuthMiddleware,
};
