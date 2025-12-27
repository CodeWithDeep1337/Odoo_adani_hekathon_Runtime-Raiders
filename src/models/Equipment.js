/**
 * Equipment Model
 * Defines the structure of equipment in the system
 */

const { EQUIPMENT_CATEGORIES } = require('../config/constants');
const { generateEquipmentId } = require('../utils/idGenerator');
const { getTodayDate } = require('../utils/dateHelper');

class Equipment {
  constructor(data) {
    this.id = data.id || generateEquipmentId();
    this.equipmentName = data.equipmentName;
    this.serialNumber = data.serialNumber;
    this.category = data.category;
    this.purchaseDate = data.purchaseDate;
    this.warrantyExpiry = data.warrantyExpiry;
    this.department = data.department;
    this.assignedEmployee = data.assignedEmployee || null;
    this.maintenanceTeamId = data.maintenanceTeamId || null;
    this.location = data.location;
    this.isScrapped = data.isScrapped || false;
    this.createdAt = data.createdAt || getTodayDate();
    this.updatedAt = data.updatedAt || getTodayDate();
  }

  /**
   * Check if warranty is expired
   */
  isWarrantyExpired() {
    const today = new Date();
    const warrantyDate = new Date(this.warrantyExpiry);
    return warrantyDate < today;
  }

  /**
   * Check if equipment is old (> 5 years)
   */
  isOld() {
    const today = new Date();
    const purchaseDate = new Date(this.purchaseDate);
    const ageInYears = (today - purchaseDate) / (365.25 * 24 * 60 * 60 * 1000);
    return ageInYears > 5;
  }

  /**
   * Get warranty days remaining
   */
  getWarrantyDaysRemaining() {
    const today = new Date();
    const warrantyDate = new Date(this.warrantyExpiry);
    const daysRemaining = Math.ceil((warrantyDate - today) / (24 * 60 * 60 * 1000));
    return daysRemaining;
  }

  /**
   * Convert to JSON
   */
  toJSON() {
    return {
      id: this.id,
      equipmentName: this.equipmentName,
      serialNumber: this.serialNumber,
      category: this.category,
      purchaseDate: this.purchaseDate,
      warrantyExpiry: this.warrantyExpiry,
      warrantyExpired: this.isWarrantyExpired(),
      warrantyDaysRemaining: this.getWarrantyDaysRemaining(),
      department: this.department,
      assignedEmployee: this.assignedEmployee,
      maintenanceTeamId: this.maintenanceTeamId,
      location: this.location,
      isScrapped: this.isScrapped,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Equipment;
