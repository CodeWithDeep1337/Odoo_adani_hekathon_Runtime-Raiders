/**
 * Demo Storage Service
 * In-memory storage for development/demo mode when database is unavailable
 * Allows full testing of frontend integration without a live MySQL database
 */

// In-memory storage
const storage = {
  users: new Map(),
  otps: new Map(),
  sessions: new Map(),
  maintenanceRequests: new Map(),
};

// User counter for IDs
let userCounter = 1;

const demoStorage = {
  /**
   * Save user
   */
  saveUser(user) {
    const userId = `demo-user-${userCounter++}`;
    const userData = {
      id: userId,
      name: user.name,
      email: user.email,
      password_hash: user.password_hash,
      role: user.role || 'USER',
      status: 'VERIFIED', // Auto-verify for demo
      created_at: new Date().toISOString(),
    };
    storage.users.set(user.email, userData);
    storage.users.set(userId, userData);
    return userData;
  },

  /**
   * Get user by email
   */
  getUserByEmail(email) {
    return storage.users.get(email) || null;
  },

  /**
   * Get user by ID
   */
  getUserById(userId) {
    return storage.users.get(userId) || null;
  },

  /**
   * Save OTP
   */
  saveOTP(userId, email, otpHash, otpType) {
    const otpRecord = {
      id: `otp-${Date.now()}`,
      user_id: userId,
      email,
      otp_hash: otpHash,
      otp_type: otpType,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 10 * 60000).toISOString(), // 10 minutes
    };
    storage.otps.set(email, otpRecord);
    return otpRecord;
  },

  /**
   * Get OTP by email
   */
  getOTPByEmail(email) {
    const otp = storage.otps.get(email);
    if (!otp) return null;

    // Check if expired
    if (new Date() > new Date(otp.expires_at)) {
      storage.otps.delete(email);
      return null;
    }

    return otp;
  },

  /**
   * Delete OTP
   */
  deleteOTP(email) {
    storage.otps.delete(email);
  },

  /**
   * Create session
   */
  createSession(userId, token) {
    const session = {
      id: `session-${Date.now()}`,
      user_id: userId,
      token,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60000).toISOString(), // 24 hours
    };
    storage.sessions.set(token, session);
    return session;
  },

  /**
   * Save maintenance request
   */
  saveMaintenanceRequest(request) {
    storage.maintenanceRequests.set(request.id, request);
    return request;
  },

  /**
   * Get maintenance request by ID
   */
  getMaintenanceRequestById(id) {
    return storage.maintenanceRequests.get(id) || null;
  },

  /**
   * Get all maintenance requests
   */
  getAllMaintenanceRequests() {
    return Array.from(storage.maintenanceRequests.values());
  },

  /**
   * Get session by token
   */
  getSessionByToken(token) {
    const session = storage.sessions.get(token);
    if (!session) return null;

    // Check if expired
    if (new Date() > new Date(session.expires_at)) {
      storage.sessions.delete(token);
      return null;
    }

    return session;
  },

  /**
   * Get all data (for debugging)
   */
  getAllData() {
    return {
      users: Array.from(storage.users.values()).filter(u => !u.id.includes('-')),
      otps: Array.from(storage.otps.values()),
      sessions: Array.from(storage.sessions.values()),
      maintenanceRequests: Array.from(storage.maintenanceRequests.values()),
    };
  },

  /**
   * Clear all data
   */
  clearAllData() {
    storage.users.clear();
    storage.otps.clear();
    storage.sessions.clear();
    storage.maintenanceRequests.clear();
    userCounter = 1;
  },
};

module.exports = demoStorage;
