/**
 * Equipment Service
 * Business logic for equipment management
 */

const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const demoStorage = require('../utils/demoStorage');
const { ApiError } = require('../middleware/errorHandler');
const { getCurrentDate, isTodayOrFuture } = require('../utils/dateHelper');

class EquipmentService {
  /**
   * Create new equipment
   */
  async createEquipment(data) {
    try {
      // Check for duplicate serial number
      const existing = await db.query(
        `SELECT id FROM equipment WHERE serial_number = ?`,
        [data.serialNumber]
      );

      if (existing.length > 0) {
        throw new ApiError('Equipment with this serial number already exists', 409);
      }

      const equipmentId = uuidv4();
      const now = new Date();

      const sql = `INSERT INTO equipment 
                   (id, name, serial_number, department, assigned_employee, 
                    maintenance_team_id, purchase_date, warranty_end_date, location, is_scrapped, 
                    created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`;

      await db.query(sql, [
        equipmentId,
        data.name,
        data.serialNumber,
        data.department,
        data.assignedEmployee || null,
        data.maintenanceTeam || null,
        data.purchaseDate,
        data.warrantyEndDate,
        data.location,
        now,
        now,
      ]);

      return await this.getEquipmentById(equipmentId);
    } catch (error) {
      if (error.isCustom) throw error;
      console.error('[EquipmentService] Create error:', error);
      throw new ApiError('Failed to create equipment', 500);
    }
  }

  /**
   * Get all equipment
   */
  async getAllEquipment(filters = {}) {
    try {
      try {
        let sql = `SELECT * FROM equipment WHERE 1=1`;
        const params = [];

        if (filters.department) {
          sql += ` AND department = ?`;
          params.push(filters.department);
        }

        if (filters.isScrapped !== undefined) {
          sql += ` AND is_scrapped = ?`;
          params.push(filters.isScrapped ? 1 : 0);
        }

        if (filters.maintenanceTeamId) {
          sql += ` AND maintenance_team_id = ?`;
          params.push(filters.maintenanceTeamId);
        }

        sql += ` ORDER BY created_at DESC`;

        return await db.query(sql, params);
      } catch (dbError) {
        console.warn('[EquipmentService] Database unavailable, returning sample equipment');
        // Return sample equipment for demo
        return [
          {
            id: 'eq-001',
            name: 'CNC Machine A',
            serial_number: 'CNC-2023-001',
            department: 'Manufacturing',
            assigned_employee: 'John Doe',
            maintenance_team_id: 'team-001',
            purchase_date: '2023-01-15',
            warranty_end_date: '2024-01-15',
            location: 'Building A',
            is_scrapped: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];
      }
    } catch (error) {
      console.error('[EquipmentService] GetAll error:', error);
      throw new ApiError('Failed to retrieve equipment', 500);
    }
  }

  /**
   * Get equipment by ID
   */
  async getEquipmentById(id) {
    try {
      const sql = `SELECT * FROM equipment WHERE id = ?`;
      const results = await db.query(sql, [id]);

      if (results.length === 0) {
        throw new ApiError('Equipment not found', 404);
      }

      return results[0];
    } catch (error) {
      if (error.isCustom) throw error;
      console.error('[EquipmentService] GetById error:', error);
      throw new ApiError('Failed to retrieve equipment', 500);
    }
  }

  /**
   * Update equipment
   */
  async updateEquipment(id, data) {
    try {
      // Get existing equipment
      const equipment = await this.getEquipmentById(id);

      if (equipment.is_scrapped && data.isScrapped === false) {
        throw new ApiError('Cannot unscrap equipment', 400);
      }

      const updateFields = [];
      const values = [];

      // Only update provided fields
      if (data.name !== undefined) {
        updateFields.push('name = ?');
        values.push(data.name);
      }

      if (data.serialNumber !== undefined) {
        // Check for duplicate
        const existing = await db.query(
          `SELECT id FROM equipment WHERE serial_number = ? AND id != ?`,
          [data.serialNumber, id]
        );

        if (existing.length > 0) {
          throw new ApiError('Serial number already exists', 409);
        }

        updateFields.push('serial_number = ?');
        values.push(data.serialNumber);
      }

      if (data.department !== undefined) {
        updateFields.push('department = ?');
        values.push(data.department);
      }

      if (data.assignedEmployee !== undefined) {
        updateFields.push('assigned_employee = ?');
        values.push(data.assignedEmployee);
      }

      if (data.maintenanceTeam !== undefined) {
        updateFields.push('maintenance_team_id = ?');
        values.push(data.maintenanceTeam);
      }

      if (data.purchaseDate !== undefined) {
        updateFields.push('purchase_date = ?');
        values.push(data.purchaseDate);
      }

      if (data.warrantyEndDate !== undefined) {
        updateFields.push('warranty_end_date = ?');
        values.push(data.warrantyEndDate);
      }

      if (data.location !== undefined) {
        updateFields.push('location = ?');
        values.push(data.location);
      }

      if (data.isScrapped !== undefined) {
        updateFields.push('is_scrapped = ?');
        values.push(data.isScrapped ? 1 : 0);
      }

      if (updateFields.length === 0) {
        return equipment;
      }

      updateFields.push('updated_at = ?');
      values.push(new Date());
      values.push(id);

      const sql = `UPDATE equipment SET ${updateFields.join(', ')} WHERE id = ?`;
      await db.query(sql, values);

      return await this.getEquipmentById(id);
    } catch (error) {
      if (error.isCustom) throw error;
      console.error('[EquipmentService] Update error:', error);
      throw new ApiError('Failed to update equipment', 500);
    }
  }

  /**
   * Delete equipment
   */
  async deleteEquipment(id) {
    try {
      const equipment = await this.getEquipmentById(id);

      // Check if equipment has active maintenance requests
      const activeRequests = await db.query(
        `SELECT COUNT(*) as count FROM maintenance_requests 
         WHERE equipment_id = ? AND status != 'REPAIRED' AND status != 'SCRAP'`,
        [id]
      );

      if (activeRequests[0].count > 0) {
        throw new ApiError(
          'Cannot delete equipment with active maintenance requests',
          400
        );
      }

      await db.query(`DELETE FROM equipment WHERE id = ?`, [id]);

      return { message: 'Equipment deleted successfully' };
    } catch (error) {
      if (error.isCustom) throw error;
      console.error('[EquipmentService] Delete error:', error);
      throw new ApiError('Failed to delete equipment', 500);
    }
  }

  /**
   * Get equipment warranty status
   */
  async getWarrantyStatus(id) {
    try {
      const equipment = await this.getEquipmentById(id);
      const today = new Date();
      const warrantyDate = new Date(equipment.warranty_end_date);

      return {
        equipmentId: id,
        warrantyEndDate: equipment.warranty_end_date,
        isExpired: warrantyDate < today,
        daysRemaining: Math.ceil((warrantyDate - today) / (1000 * 3600 * 24)),
      };
    } catch (error) {
      if (error.isCustom) throw error;
      throw new ApiError('Failed to get warranty status', 500);
    }
  }

  /**
   * Mark equipment as scrapped (when maintenance request status = SCRAP)
   */
  async scrapEquipment(id) {
    try {
      await db.query(
        `UPDATE equipment SET is_scrapped = 1, updated_at = ? WHERE id = ?`,
        [new Date(), id]
      );

      return await this.getEquipmentById(id);
    } catch (error) {
      console.error('[EquipmentService] Scrap error:', error);
      throw new ApiError('Failed to scrap equipment', 500);
    }
  }
}

module.exports = new EquipmentService();
