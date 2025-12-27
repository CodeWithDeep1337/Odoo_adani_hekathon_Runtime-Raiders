/**
 * Utility functions for ID generation
 */

let equipmentIdCounter = 1;
let teamIdCounter = 1;
let requestIdCounter = 1;
let logIdCounter = 1;

/**
 * Generate unique equipment ID
 */
const generateEquipmentId = () => {
  return `EQP-${String(equipmentIdCounter++).padStart(5, '0')}`;
};

/**
 * Generate unique maintenance team ID
 */
const generateTeamId = () => {
  return `TEAM-${String(teamIdCounter++).padStart(4, '0')}`;
};

/**
 * Generate unique maintenance request ID
 */
const generateRequestId = () => {
  return `REQ-${String(requestIdCounter++).padStart(6, '0')}`;
};

/**
 * Generate unique system log ID
 */
const generateLogId = () => {
  return `LOG-${String(logIdCounter++).padStart(7, '0')}`;
};

/**
 * Reset counters for testing
 */
const resetIdCounters = () => {
  equipmentIdCounter = 1;
  teamIdCounter = 1;
  requestIdCounter = 1;
  logIdCounter = 1;
};

module.exports = {
  generateEquipmentId,
  generateTeamId,
  generateRequestId,
  generateLogId,
  resetIdCounters
};
