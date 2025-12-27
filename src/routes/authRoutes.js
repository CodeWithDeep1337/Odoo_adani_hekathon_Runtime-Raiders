/**
 * Authentication Routes
 */

const express = require('express');
const { validateBody, validateQuery } = require('../middleware/validationMiddleware');
const { authMiddleware } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/securityMiddleware');
const {
  otpVerificationLimiter,
  otpResendLimiter,
  forgotPasswordLimiter,
  validateOtpFormat,
  sanitizeEmail,
} = require('../middleware/otpSecurityMiddleware');
const {
  signUpSchema,
  signInSchema,
  otpVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require('../validations/schemas');
const AuthController = require('../controllers/AuthController');

const router = express.Router();

/**
 * Public routes (with rate limiting)
 */

// Sign up
router.post('/signup', authLimiter, validateBody(signUpSchema), AuthController.signUp);

// Sign in
router.post('/signin', authLimiter, validateBody(signInSchema), AuthController.signIn);

// Verify OTP (with enhanced security)
router.post(
  '/verify-otp',
  otpVerificationLimiter,
  sanitizeEmail,
  validateOtpFormat,
  validateBody(otpVerificationSchema),
  AuthController.verifyOTP
);

// Resend OTP (with enhanced security)
router.post(
  '/resend-otp',
  otpResendLimiter,
  sanitizeEmail,
  AuthController.resendOTP
);

// Forgot password (send OTP)
router.post(
  '/forgot-password',
  forgotPasswordLimiter,
  sanitizeEmail,
  validateBody(forgotPasswordSchema),
  AuthController.forgotPassword
);

// Reset password
router.post('/reset-password', authLimiter, validateBody(resetPasswordSchema), AuthController.resetPassword);

// Refresh token
router.post('/refresh-token', authLimiter, AuthController.refreshToken);

/**
 * Protected routes
 */

// Get current user profile
router.get('/profile', authMiddleware, AuthController.getCurrentUser);

// Logout
router.post('/logout', authMiddleware, AuthController.logout);

module.exports = router;
