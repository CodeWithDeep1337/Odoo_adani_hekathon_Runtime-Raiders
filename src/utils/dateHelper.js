/**
 * Date Utility Functions
 * Date validation and manipulation
 */

/**
 * Get current date (YYYY-MM-DD)
 */
const getCurrentDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get current date in ISO format (date only)
 */
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

/**
 * Get current datetime in ISO format
 */
const getCurrentDateTime = () => {
  return new Date().toISOString();
};

/**
 * Check if date is in past
 */
const isPastDate = (date) => {
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  inputDate.setHours(0, 0, 0, 0);
  return inputDate < today;
};

/**
 * Check if a date is in the past
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {boolean}
 */
const isDateInPast = (dateStr) => {
  const targetDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);
  return targetDate < today;
};

/**
 * Check if date is today or future
 */
const isTodayOrFuture = (date) => {
  return !isPastDate(date);
};

/**
 * Format date (YYYY-MM-DD)
 */
const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get days remaining until date
 */
const getDaysRemaining = (date) => {
};

/**
 * Get date after N days
 */
const getDateAfterDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return formatDate(date);
};

/**
 * Check if date is within range
 */
const isDateInRange = (date, startDate, endDate) => {
  const d = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);
  return d >= start && d <= end;
};

module.exports = {
  getCurrentDate,
  getTodayDate,
  getCurrentDateTime,
  isPastDate,
  isDateInPast,
  isTodayOrFuture,
  formatDate,
  getDaysRemaining,
  getDateAfterDays,
  isDateInRange,
};

