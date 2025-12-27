/**
 * Authentication Controller
 * Handles authentication requests - delegates to AuthService
 */

const AuthService = require('../services/AuthService');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Sign up
 * POST /api/auth/signup
 */
const signUp = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const result = await AuthService.signUp(name, email, password, role);

  res.status(201).json({
    success: true,
    message: 'User registered successfully. Please verify your email with the OTP sent.',
    data: {
      userId: result.userId,
      email: result.email,
      message: 'Check your email for OTP verification code.',
    },
  });
});

/**
 * Verify OTP
 * POST /api/auth/verify-otp
 */
const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await AuthService.verifyOTP(email, otp);

  res.status(200).json({
    success: true,
    message: 'Email verified successfully',
    data: user,
  });
});

/**
 * Resend OTP
 * POST /api/auth/resend-otp
 */
const resendOTP = asyncHandler(async (req, res) => {
  const { email, type = 'EMAIL_VERIFICATION' } = req.body;

  const result = await AuthService.resendOTP(email, type);

  res.status(200).json({
    success: true,
    message: result.message,
    data: {
      email: result.email,
    },
  });
});

/**
 * Sign in
 * POST /api/auth/signin
 */
const signIn = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await AuthService.signIn(email, password);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresIn: '15m',
    },
  });
});

/**
 * Forgot Password
 * POST /api/auth/forgot-password
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const result = await AuthService.forgotPassword(email);

  res.status(200).json({
    success: true,
    message: 'Password reset OTP sent to your email',
    data: {
      email,
      message: 'Check your email for OTP to reset your password.',
    },
  });
});

/**
 * Reset Password
 * POST /api/auth/reset-password
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  await AuthService.resetPassword(email, otp, newPassword);

  res.status(200).json({
    success: true,
    message: 'Password reset successfully. Please sign in with your new password.',
  });
});

/**
 * Refresh Access Token
 * POST /api/auth/refresh-token
 */
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  const tokens = await AuthService.refreshAccessToken(refreshToken);

  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    data: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: '15m',
    },
  });
});

/**
 * Get Current User
 * GET /api/auth/profile
 */
const getCurrentUser = asyncHandler(async (req, res) => {
  const user = req.user;

  res.status(200).json({
    success: true,
    message: 'User profile retrieved',
    data: user,
  });
});

/**
 * Logout
 * POST /api/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    await AuthService.logout(refreshToken);
  }

  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
});

module.exports = {
  signUp,
  verifyOTP,
  resendOTP,
  signIn,
  forgotPassword,
  resetPassword,
  refreshToken,
  getCurrentUser,
  logout,
};
