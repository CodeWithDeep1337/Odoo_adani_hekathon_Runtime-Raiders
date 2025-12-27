/**
 * Security Middleware
 * Helmet, CORS, Rate Limiting
 */

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('../config/env');

/**
 * Security headers using Helmet
 */
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  frameguard: {
    action: 'deny',
  },
  noSniff: true,
  xssFilter: true,
});

/**
 * CORS Middleware
 */
const corsMiddleware = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', config.FRONTEND_URL || '*');
  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS, PATCH'
  );
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
};

/**
 * General API rate limiter
 */
const apiLimiter = rateLimit({
  windowMs: config.API_RATE_LIMIT_WINDOW * 60 * 1000, // Convert to milliseconds
  max: config.API_RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => config.NODE_ENV === 'development', // Skip rate limiting in development
});

/**
 * Authentication rate limiter (stricter)
 */
const authLimiter = rateLimit({
  windowMs: config.AUTH_RATE_LIMIT_WINDOW * 60 * 1000,
  max: config.AUTH_RATE_LIMIT_MAX_REQUESTS,
  message:
    'Too many authentication attempts, please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => config.NODE_ENV === 'development',
});

/**
 * OTP Verification rate limiter (very strict - 5 attempts per 15 minutes)
 */
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message:
    'Too many OTP verification attempts. Please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => config.NODE_ENV === 'development',
  keyGenerator: (req) => {
    // Rate limit by email instead of IP for OTP
    return req.body?.email || req.ip;
  },
});

/**
 * OTP Resend rate limiter (3 attempts per 10 minutes)
 */
const otpResendLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3,
  message:
    'Too many OTP resend requests. Please try again after 10 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => config.NODE_ENV === 'development',
  keyGenerator: (req) => {
    // Rate limit by email instead of IP for OTP
    return req.body?.email || req.ip;
  },
});

module.exports = {
  securityHeaders,
  corsMiddleware,
  apiLimiter,
  authLimiter,
  otpLimiter,
  otpResendLimiter,
};
