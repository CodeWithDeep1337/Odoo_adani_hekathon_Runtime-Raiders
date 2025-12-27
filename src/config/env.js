/**
 * Environment Configuration
 * Centralized environment variable management
 */

const dotenv = require('dotenv');
dotenv.config();

const config = {
  // App
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  HOST: process.env.HOST || 'localhost',

  // Database
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'gearguard',
  DB_PORT: process.env.DB_PORT || 3306,

  // JWT
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'access_secret_key_change_in_production',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'refresh_secret_key_change_in_production',
  JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY || '15m',
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',

  // OTP
  OTP_EXPIRY: parseInt(process.env.OTP_EXPIRY) || 300000, // 5 minutes
  OTP_MAX_ATTEMPTS: parseInt(process.env.OTP_MAX_ATTEMPTS) || 5,
  OTP_LENGTH: parseInt(process.env.OTP_LENGTH) || 6,

  // Email
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT) || 587,
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASSWORD: process.env.SMTP_PASSWORD || '',
  SMTP_FROM: process.env.SMTP_FROM || 'noreply@gearguard.com',

  // Rate Limiting
  API_RATE_LIMIT_WINDOW: parseInt(process.env.API_RATE_LIMIT_WINDOW) || 15,
  API_RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.API_RATE_LIMIT_MAX_REQUESTS) || 100,
  AUTH_RATE_LIMIT_WINDOW: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW) || 15,
  AUTH_RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS) || 5,

  // Security
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 10,

  // Frontend
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',

  // Validation
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

module.exports = config;
