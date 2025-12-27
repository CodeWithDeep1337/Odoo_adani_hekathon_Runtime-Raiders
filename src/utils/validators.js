/**
 * Data validation utilities
 */

const { REQUEST_TYPES, EQUIPMENT_CATEGORIES, MAINTENANCE_STAGES } = require('../config/constants');

/**
 * Validate equipment data
 */
const validateEquipmentData = (data) => {
  const errors = [];

  if (!data.equipmentName || data.equipmentName.trim().length === 0) {
    errors.push('Equipment name is required');
  }

  if (!data.serialNumber || data.serialNumber.trim().length === 0) {
    errors.push('Serial number is required');
  }

  if (!data.category || !Object.values(EQUIPMENT_CATEGORIES).includes(data.category)) {
    errors.push('Invalid or missing equipment category');
  }

  if (!data.purchaseDate || !isValidDate(data.purchaseDate)) {
    errors.push('Valid purchase date is required (YYYY-MM-DD)');
  }

  if (!data.warrantyExpiry || !isValidDate(data.warrantyExpiry)) {
    errors.push('Valid warranty expiry date is required (YYYY-MM-DD)');
  }

  if (!data.department || data.department.trim().length === 0) {
    errors.push('Department is required');
  }

  if (!data.location || data.location.trim().length === 0) {
    errors.push('Location is required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Validate maintenance team data
 */
const validateTeamData = (data) => {
  const errors = [];

  if (!data.teamName || data.teamName.trim().length === 0) {
    errors.push('Team name is required');
  }

  if (!Array.isArray(data.technicians)) {
    errors.push('Technicians must be an array');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Validate maintenance request data
 */
const validateMaintenanceRequestData = (data, requestType) => {
  const errors = [];

  if (!data.subject || data.subject.trim().length === 0) {
    errors.push('Subject is required');
  }

  if (!data.equipmentId || data.equipmentId.trim().length === 0) {
    errors.push('Equipment ID is required');
  }

  if (requestType === REQUEST_TYPES.PREVENTIVE) {
    if (!data.scheduledDate || !isValidDate(data.scheduledDate)) {
      errors.push('Valid scheduled date is required for preventive requests (YYYY-MM-DD)');
    }
  }

  if (data.durationHours && (typeof data.durationHours !== 'number' || data.durationHours < 0)) {
    errors.push('Duration hours must be a non-negative number');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Validate date format YYYY-MM-DD
 */
const isValidDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') {
    return false;
  }
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) {
    return false;
  }
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Sanitize string input
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') {
    return str;
  }
  return str.trim();
};

/**
 * Sanitize object data
 */
const sanitizeData = (data) => {
  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    sanitized[key] = typeof value === 'string' ? sanitizeString(value) : value;
  }
  return sanitized;
};

module.exports = {
  validateEquipmentData,
  validateTeamData,
  validateMaintenanceRequestData,
  isValidDate,
  sanitizeString,
  sanitizeData
};
