/**
 * OTP Security Middleware
 * Additional security measures for OTP endpoints
 */

const rateLimit = require('express-rate-limit');
const config = require('../config/env');

/**
 * OTP Verification rate limiter
 * Stricter than general auth limiter
 */
const otpVerificationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // Max 5 attempts per email per 5 minutes
  message: 'Too many OTP verification attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => config.NODE_ENV === 'development',
  keyGenerator: (req, res) => {
    // Use email as key instead of IP for better targeting
    return req.body.email || req.ip;
  },
});

/**
 * OTP Resend rate limiter
 * Prevent spam resending
 */
const otpResendLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes between resends
  max: 3, // Max 3 resend attempts per email per 2 minutes
  message: 'Please wait before requesting another OTP.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => config.NODE_ENV === 'development',
  keyGenerator: (req, res) => {
    // Use email as key instead of IP
    return req.body.email || req.ip;
  },
});

/**
 * Forgot Password rate limiter
 * Prevent abuse of password reset endpoint
 */
const forgotPasswordLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 3, // Max 3 reset requests per email per 30 minutes
  message: 'Too many password reset requests. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => config.NODE_ENV === 'development',
  keyGenerator: (req, res) => {
    // Use email as key instead of IP
    return req.body.email || req.ip;
  },
});

/**
 * Middleware to validate OTP format before processing
 */
const validateOtpFormat = (req, res, next) => {
  const { otp } = req.body;

  if (!otp) {
    return res.status(400).json({
      success: false,
      message: 'OTP is required',
    });
  }

  // Check if OTP is 6 digits
  if (!/^\d{6}$/.test(otp)) {
    return res.status(400).json({
      success: false,
      message: 'OTP must be exactly 6 digits',
    });
  }

  next();
};

/**
 * Middleware to sanitize email input
 */
const sanitizeEmail = (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required',
    });
  }

  // Trim and lowercase
  req.body.email = email.trim().toLowerCase();

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(req.body.email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format',
    });
  }

  next();
};

/**
 * Middleware to prevent brute force password reset
 * Tracks failed attempts per email
 */
const passwordResetAttemptTracker = (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next();
  }

  // Store attempt count in memory (in production, use Redis)
  global.passwordResetAttempts = global.passwordResetAttempts || {};

  const key = `${email.toLowerCase()}-reset`;
  const now = Date.now();
  const window = 24 * 60 * 60 * 1000; // 24 hours

  if (!global.passwordResetAttempts[key]) {
    global.passwordResetAttempts[key] = [];
  }

  // Clean old attempts
  global.passwordResetAttempts[key] = global.passwordResetAttempts[key].filter(
    (timestamp) => now - timestamp < window
  );

  // Max 5 reset attempts per 24 hours
  if (global.passwordResetAttempts[key].length >= 5) {
    return res.status(429).json({
      success: false,
      message: 'Too many password reset attempts. Please try again later.',
    });
  }

  next();
};

module.exports = {
  otpVerificationLimiter,
  otpResendLimiter,
  forgotPasswordLimiter,
  validateOtpFormat,
  sanitizeEmail,
  passwordResetAttemptTracker,
};
