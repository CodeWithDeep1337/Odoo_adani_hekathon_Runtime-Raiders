/**
 * Maintenance Request Model
 * Defines the structure of maintenance requests
 */

const { MAINTENANCE_STAGES, REQUEST_TYPES } = require('../config/constants');
const { generateRequestId, generateLogId } = require('../utils/idGenerator');
const { getTodayDate, getCurrentDateTime, isDateInPast } = require('../utils/dateHelper');

class MaintenanceRequest {
  constructor(data) {
    this.id = data.id || generateRequestId();
    this.subject = data.subject;
    this.requestType = data.requestType; // Corrective or Preventive
    this.equipmentId = data.equipmentId;
    this.category = data.category; // Auto-filled from equipment
    this.maintenanceTeamId = data.maintenanceTeamId; // Auto-filled from equipment
    this.assignedTechnicianId = data.assignedTechnicianId || null;
    this.scheduledDate = data.scheduledDate || null; // Required for Preventive
    this.durationHours = data.durationHours || null;
    this.stage = data.stage || MAINTENANCE_STAGES.NEW; // New, In Progress, Repaired, Scrap
    this.overdue = data.overdue || false; // Auto-calculated
    this.createdAt = data.createdAt || getTodayDate();
    this.updatedAt = data.updatedAt || getTodayDate();
    this.completedAt = data.completedAt || null;
  }

  /**
   * Calculate if request is overdue
   * For Preventive: if scheduledDate < today and not Repaired
   */
  calculateOverdue() {
    if (this.requestType === REQUEST_TYPES.PREVENTIVE && this.scheduledDate) {
      const isOverdue = isDateInPast(this.scheduledDate) && this.stage !== MAINTENANCE_STAGES.REPAIRED;
      this.overdue = isOverdue;
    }
    return this.overdue;
  }

  /**
   * Check if technician can be assigned
   * Technician must belong to the maintenance team
   */
  canAssignTechnician(technicianId, team) {
    if (!team) return false;
    return team.hasTechnician(technicianId);
  }

  /**
   * Assign technician to request
   */
  assignTechnician(technicianId) {
    this.assignedTechnicianId = technicianId;
    this.updatedAt = getTodayDate();
  }

  /**
   * Move request to next stage
   */
  moveToInProgress() {
    if (this.stage === MAINTENANCE_STAGES.NEW) {
      this.stage = MAINTENANCE_STAGES.IN_PROGRESS;
      this.updatedAt = getTodayDate();
      return true;
    }
    return false;
  }

  /**
   * Mark request as repaired
   * Requires duration hours
   */
  markAsRepaired(durationHours) {
    if (this.stage === MAINTENANCE_STAGES.IN_PROGRESS && durationHours && durationHours > 0) {
      this.stage = MAINTENANCE_STAGES.REPAIRED;
      this.durationHours = durationHours;
      this.completedAt = getTodayDate();
      this.updatedAt = getTodayDate();
      this.overdue = false;
      return true;
    }
    return false;
  }

  /**
   * Mark request for scrap
   */
  markAsScrap() {
    this.stage = MAINTENANCE_STAGES.SCRAP;
    this.completedAt = getTodayDate();
    this.updatedAt = getTodayDate();
    this.overdue = false;
    return true;
  }

  /**
   * Check if request is closed
   */
  isClosed() {
    return this.stage === MAINTENANCE_STAGES.REPAIRED || this.stage === MAINTENANCE_STAGES.SCRAP;
  }

  /**
   * Check if request is open
   */
  isOpen() {
    return !this.isClosed();
  }

  /**
   * Convert to JSON
   */
  toJSON() {
    return {
      id: this.id,
      subject: this.subject,
      requestType: this.requestType,
      equipmentId: this.equipmentId,
      category: this.category,
      maintenanceTeamId: this.maintenanceTeamId,
      assignedTechnicianId: this.assignedTechnicianId,
      scheduledDate: this.scheduledDate,
      durationHours: this.durationHours,
      stage: this.stage,
      overdue: this.overdue,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      completedAt: this.completedAt
    };
  }
}

module.exports = MaintenanceRequest;
