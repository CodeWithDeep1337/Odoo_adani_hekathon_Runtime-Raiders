/**
 * Maintenance Team Model
 * Defines the structure of maintenance teams
 */

const { generateTeamId } = require('../utils/idGenerator');
const { getTodayDate } = require('../utils/dateHelper');

class MaintenanceTeam {
  constructor(data) {
    this.id = data.id || generateTeamId();
    this.teamName = data.teamName;
    this.technicians = data.technicians || []; // Array of technician IDs
    this.createdAt = data.createdAt || getTodayDate();
    this.updatedAt = data.updatedAt || getTodayDate();
  }

  /**
   * Add a technician to the team
   */
  addTechnician(technicianId) {
    if (!this.technicians.includes(technicianId)) {
      this.technicians.push(technicianId);
      return true;
    }
    return false;
  }

  /**
   * Remove a technician from the team
   */
  removeTechnician(technicianId) {
    const index = this.technicians.indexOf(technicianId);
    if (index > -1) {
      this.technicians.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Check if technician belongs to team
   */
  hasTechnician(technicianId) {
    return this.technicians.includes(technicianId);
  }

  /**
   * Get team size
   */
  getTeamSize() {
    return this.technicians.length;
  }

  /**
   * Convert to JSON
   */
  toJSON() {
    return {
      id: this.id,
      teamName: this.teamName,
      technicians: this.technicians,
      teamSize: this.getTeamSize(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = MaintenanceTeam;
