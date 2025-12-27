/**
 * Error Handling Middleware
 * Centralized error handling for all endpoints
 */

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[Error] ${status} - ${message}`);
  if (err.stack && process.env.NODE_ENV === 'development') {
    console.error('[Stack]', err.stack);
  }

  // Validation errors
  if (err.details) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      data: {
        errors: err.details.map((e) => ({
          field: e.context.key,
          message: e.message,
        })),
      },
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      data: {},
    });
  }

  // Database errors
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      message: 'Duplicate entry found',
      data: {},
    });
  }

  // Custom errors
  if (err.isCustom) {
    return res.status(status).json({
      success: false,
      message: message,
      data: err.data || {},
    });
  }

  // Default error response
  res.status(status).json({
    success: false,
    message: message,
    data: {},
  });
};

/**
 * 404 Not Found middleware
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route '${req.originalUrl}' not found`,
    data: {},
  });
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Custom API Error class
 */
class ApiError extends Error {
  constructor(message, status = 500, data = {}) {
    super(message);
    this.status = status;
    this.data = data;
    this.isCustom = true;
  }
}

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  ApiError,
};
