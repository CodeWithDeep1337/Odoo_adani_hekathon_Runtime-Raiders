/**
 * User Model
 * Represents the user with authentication details
 */

const { v4: uuidv4 } = require('uuid');
const { getCurrentDate } = require('../utils/dateHelper');

class User {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.name = data.name;
    this.email = data.email;
    this.passwordHash = data.passwordHash;
    this.role = data.role || 'USER'; // ADMIN, MANAGER, TECHNICIAN, USER
    this.status = data.status || 'PENDING_VERIFICATION'; // PENDING_VERIFICATION, VERIFIED, BLOCKED
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Convert to JSON (without sensitive data)
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Convert to secure response
   */
  toSecureJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      status: this.status,
    };
  }
}

module.exports = User;
