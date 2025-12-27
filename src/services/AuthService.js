/**
 * Authentication Service
 * Handles user registration, login, OTP verification, and password reset
 */

const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const demoStorage = require('../utils/demoStorage');
const { hashPassword, comparePassword, generateOTP, hashOTP, verifyOTP } = require('../utils/cryptoHelper');
const { generateTokenPair } = require('../utils/jwtHelper');
const { sendOtpEmail, sendPasswordResetEmail } = require('../config/mailer');
const { ApiError } = require('../middleware/errorHandler');
const config = require('../config/env');
const { getCurrentTimestamp } = require('../utils/dateHelper');
const User = require('../models/User');

class AuthService {
  /**
   * Sign up new user
   */
  async signUp(name, email, password, role = 'USER') {
    // Check if user already exists
    const existingUser = await this.getUserByEmail(email);
    if (existingUser) {
      throw new ApiError('Email already registered', 409);
    }

    const userId = uuidv4();
    const passwordHash = await hashPassword(password);

    try {
      // Try database first
      let userCreated = false;
      try {
        const sql = `INSERT INTO users (id, name, email, password_hash, role, status) 
                     VALUES (?, ?, ?, ?, ?, ?)`;
        await db.query(sql, [userId, name, email, passwordHash, role, 'PENDING_VERIFICATION']);
        userCreated = true;
        console.log('[AuthService] User created in database');
      } catch (dbError) {
        // Fallback to demo storage
        console.warn('[AuthService] Database unavailable, using demo storage:', dbError.message);
        const user = demoStorage.saveUser({
          name,
          email,
          password_hash: passwordHash,
          role,
        });
        userCreated = true;
      }

      if (userCreated) {
        // Generate OTP
        const otp = generateOTP();
        const otpHash = await hashOTP(otp);
        
        // Store OTP
        try {
          await this.storeOTP(userId, email, otpHash, 'EMAIL_VERIFICATION');
        } catch (otpError) {
          console.warn('[AuthService] Could not store OTP in database, using demo storage');
          demoStorage.saveOTP(userId, email, otpHash, 'EMAIL_VERIFICATION');
        }

        // Send OTP Email
        const emailResult = await sendOtpEmail(email, otp);
        
        if (emailResult.success) {
          console.log('[AuthService] OTP email sent successfully');
          return {
            userId,
            email,
            message: 'User registered successfully! Please check your email for the OTP.',
            otpSent: true,
          };
        } else {
          console.warn('[AuthService] Failed to send OTP email:', emailResult.error);
          // Even if email fails, user is created - they can request OTP resend
          return {
            userId,
            email,
            message: 'User registered! Could not send OTP email. Please check spam folder or request resend.',
            otpSent: false,
            emailError: emailResult.error,
          };
        }
      }
    } catch (error) {
      console.error('[AuthService] SignUp error:', error);
      throw new ApiError('Failed to register user', 500);
    }
  }

  /**
   * Verify OTP
   */
  async verifyOTP(email, otp) {
    try {
      let otpRecord = null;
      let isDatabase = false;

      // Try to get OTP record from database
      try {
        const sql = `SELECT * FROM otp_verifications 
                     WHERE email = ? AND otp_type = 'EMAIL_VERIFICATION' 
                     ORDER BY created_at DESC LIMIT 1`;
        const otpRecords = await db.query(sql, [email]);
        if (otpRecords.length > 0) {
          otpRecord = otpRecords[0];
          isDatabase = true;
        }
      } catch (dbError) {
        console.warn('[AuthService] Database query failed, checking demo storage');
      }

      // Fallback to demo storage
      if (!otpRecord) {
        otpRecord = demoStorage.getOTPByEmail(email);
        if (!otpRecord) {
          throw new ApiError('OTP not found or expired', 400);
        }
      }

      // Check expiry
      if (new Date() > new Date(otpRecord.expires_at)) {
        throw new ApiError('OTP expired', 400);
      }

      // Check attempts
      if (otpRecord.attempts >= config.OTP_MAX_ATTEMPTS) {
        throw new ApiError('Max OTP attempts exceeded', 429);
      }

      // Verify OTP
      const isValid = await verifyOTP(otp, otpRecord.otp_hash);
      if (!isValid) {
        throw new ApiError('Invalid OTP', 400);
      }

      // Mark user as verified
      if (isDatabase) {
        try {
          await db.query(`UPDATE users SET status = 'VERIFIED' WHERE email = ?`, [email]);
          await db.query(`DELETE FROM otp_verifications WHERE id = ?`, [otpRecord.id]);
        } catch (updateError) {
          console.warn('[AuthService] Could not update database, checking demo storage');
        }
      } else {
        // Demo storage - just delete the OTP
        demoStorage.deleteOTP(email);
      }

      // Get user
      const user = await this.getUserByEmail(email);

      return {
        user: new User(user).toSecureJSON(),
        message: 'Email verified successfully',
      };
    } catch (error) {
      if (error.isCustom) throw error;
      console.error('[AuthService] OTP verification error:', error);
      throw new ApiError('OTP verification failed', 500);
    }
  }

  /**
   * Sign in user
   */
  async signIn(email, password) {
    try {
      let user = await this.getUserByEmail(email);

      // If not in database, try demo storage
      if (!user) {
        user = demoStorage.getUserByEmail(email);
        if (user) {
          console.log('[AuthService] User found in demo storage');
        }
      }

      if (!user) {
        throw new ApiError('Invalid email or password', 401);
      }

      if (user.status !== 'VERIFIED') {
        throw new ApiError('Email not verified. Please check your inbox for OTP.', 403);
      }

      // Compare password
      const isPasswordValid = await comparePassword(password, user.password_hash);
      if (!isPasswordValid) {
        throw new ApiError('Invalid email or password', 401);
      }

      // Generate tokens
      const tokens = generateTokenPair({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      // Store refresh token (try database, fallback to demo storage)
      try {
        await this.storeRefreshToken(user.id, tokens.refreshToken);
      } catch (error) {
        console.warn('[AuthService] Could not store refresh token in database, skipping');
      }

      return {
        user: new User(user).toSecureJSON(),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
        demoMode: user.id.includes('demo-user'),
      };
    } catch (error) {
      if (error.isCustom) throw error;
      console.error('[AuthService] SignIn error:', error);
      throw new ApiError('Sign in failed', 500);
    }
  }

  /**
   * Forgot password (send OTP)
   */
  async forgotPassword(email) {
    try {
      const user = await this.getUserByEmail(email);

      if (!user) {
        // Don't reveal if email exists (security)
        return { message: 'If email exists, OTP will be sent' };
      }

      // Generate and send OTP
      const otp = generateOTP();
      const otpHash = await hashOTP(otp);
      await this.storeOTP(user.id, email, otpHash, 'PASSWORD_RESET');
      await sendPasswordResetEmail(email, otp);

      return { message: 'Password reset OTP sent to email' };
    } catch (error) {
      console.error('[AuthService] Forgot password error:', error);
      throw new ApiError('Failed to process password reset', 500);
    }
  }

  /**
   * Resend OTP
   */
  async resendOTP(email, otpType = 'EMAIL_VERIFICATION') {
    try {
      const user = await this.getUserByEmail(email);

      if (!user) {
        throw new ApiError('Email not registered', 404);
      }

      // Check if user already verified
      if (otpType === 'EMAIL_VERIFICATION' && user.status === 'VERIFIED') {
        throw new ApiError('Email already verified', 400);
      }

      // Generate new OTP
      const otp = generateOTP();
      const otpHash = await hashOTP(otp);

      // Store OTP
      try {
        await this.storeOTP(user.id, email, otpHash, otpType);
      } catch (dbError) {
        console.warn('[AuthService] Could not store OTP in database, using demo storage');
        demoStorage.saveOTP(user.id, email, otpHash, otpType);
      }

      // Send appropriate email
      let emailResult;
      if (otpType === 'EMAIL_VERIFICATION') {
        emailResult = await sendOtpEmail(email, otp);
      } else if (otpType === 'PASSWORD_RESET') {
        emailResult = await sendPasswordResetEmail(email, otp);
      }

      if (emailResult.success) {
        console.log('[AuthService] OTP resent successfully');
        return {
          success: true,
          message: 'OTP resent successfully. Please check your email.',
          email,
        };
      } else {
        console.warn('[AuthService] Failed to resend OTP:', emailResult.error);
        throw new ApiError(`Failed to send OTP: ${emailResult.error}`, 500);
      }
    } catch (error) {
      if (error.isCustom) throw error;
      console.error('[AuthService] Resend OTP error:', error);
      throw new ApiError('Failed to resend OTP', 500);
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email, otp, newPassword) {
    try {
      const sql = `SELECT * FROM otp_verifications 
                   WHERE email = ? AND otp_type = 'PASSWORD_RESET' 
                   ORDER BY created_at DESC LIMIT 1`;
      const otpRecords = await db.query(sql, [email]);

      if (otpRecords.length === 0) {
        throw new ApiError('OTP not found or expired', 400);
      }

      const otpRecord = otpRecords[0];

      // Check expiry
      if (new Date() > new Date(otpRecord.expires_at)) {
        throw new ApiError('OTP expired', 400);
      }

      // Verify OTP
      const isValid = await verifyOTP(otp, otpRecord.otp_hash);
      if (!isValid) {
        throw new ApiError('Invalid OTP', 400);
      }

      // Update password
      const passwordHash = await hashPassword(newPassword);
      await db.query(
        `UPDATE users SET password_hash = ? WHERE email = ?`,
        [passwordHash, email]
      );

      // Delete OTP record
      await db.query(`DELETE FROM otp_verifications WHERE id = ?`, [otpRecord.id]);

      return { message: 'Password reset successfully' };
    } catch (error) {
      if (error.isCustom) throw error;
      console.error('[AuthService] Reset password error:', error);
      throw new ApiError('Password reset failed', 500);
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken) {
    try {
      // Verify refresh token in database
      const sql = `SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW()`;
      const tokens = await db.query(sql, [refreshToken]);

      if (tokens.length === 0) {
        throw new ApiError('Invalid or expired refresh token', 401);
      }

      const tokenRecord = tokens[0];
      const user = await this.getUserById(tokenRecord.user_id);

      if (!user) {
        throw new ApiError('User not found', 404);
      }

      // Generate new token pair
      const newTokens = generateTokenPair({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      // Delete old refresh token and store new one
      await db.query(`DELETE FROM refresh_tokens WHERE id = ?`, [tokenRecord.id]);
      await this.storeRefreshToken(user.id, newTokens.refreshToken);

      return {
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken,
        expiresIn: newTokens.expiresIn,
      };
    } catch (error) {
      if (error.isCustom) throw error;
      console.error('[AuthService] Refresh token error:', error);
      throw new ApiError('Token refresh failed', 500);
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email) {
    try {
      const sql = `SELECT * FROM users WHERE email = ?`;
      const users = await db.query(sql, [email]);
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.warn('[AuthService] Database query failed for getUserByEmail, checking demo storage');
      // Fallback to demo storage
      return demoStorage.getUserByEmail(email);
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    try {
      const sql = `SELECT * FROM users WHERE id = ?`;
      const users = await db.query(sql, [userId]);
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.warn('[AuthService] Database query failed for getUserById, checking demo storage');
      // Fallback to demo storage
      return demoStorage.getUserById(userId);
    }
  }

  /**
   * Store OTP
   */
  async storeOTP(userId, email, otpHash, otpType = 'EMAIL_VERIFICATION') {
    try {
      // Delete previous OTP for this email
      await db.query(
        `DELETE FROM otp_verifications WHERE email = ? AND otp_type = ?`,
        [email, otpType]
      );

      // Store new OTP
      const expiresAt = new Date(Date.now() + config.OTP_EXPIRY);
      const sql = `INSERT INTO otp_verifications (id, user_id, email, otp_hash, otp_type, attempts, expires_at)
                   VALUES (?, ?, ?, ?, ?, 0, ?)`;
      await db.query(sql, [uuidv4(), userId, email, otpHash, otpType, expiresAt]);
    } catch (error) {
      console.error('[AuthService] Store OTP error:', error);
      throw error;
    }
  }

  /**
   * Store refresh token
   */
  async storeRefreshToken(userId, token) {
    try {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      const sql = `INSERT INTO refresh_tokens (id, user_id, token, expires_at)
                   VALUES (?, ?, ?, ?)`;
      await db.query(sql, [uuidv4(), userId, token, expiresAt]);
    } catch (error) {
      console.warn('[AuthService] Could not store refresh token in database:', error.message);
      // In demo mode, tokens are session-only (no storage needed)
    }
  }

  /**
   * Logout (delete refresh token)
   */
  async logout(refreshToken) {
    try {
      await db.query(`DELETE FROM refresh_tokens WHERE token = ?`, [refreshToken]);
      return { message: 'Logged out successfully' };
    } catch (error) {
      console.error('[AuthService] Logout error:', error);
      throw new ApiError('Logout failed', 500);
    }
  }
}

module.exports = new AuthService();
