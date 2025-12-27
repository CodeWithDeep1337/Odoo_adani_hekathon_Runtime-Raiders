/**
 * Maintenance Request Service
 * Business logic for maintenance requests with Kanban workflow
 */

const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const demoStorage = require('../utils/demoStorage');
const { ApiError } = require('../middleware/errorHandler');
const { isPastDate, isTodayOrFuture } = require('../utils/dateHelper');
const EquipmentService = require('./EquipmentService');

class MaintenanceRequestService {
  /**
   * Create maintenance request with smart auto-fill
   */
  async createMaintenanceRequest(data, createdBy) {
    try {
      // Validate equipment exists and not scrapped
      const equipment = await EquipmentService.getEquipmentById(data.equipmentId);

      if (equipment.is_scrapped) {
        throw new ApiError('Cannot create request for scrapped equipment', 400);
      }

      // **CRITICAL: Validate scheduled date - NO PAST DATES ALLOWED**
      if (data.scheduledDate && isPastDate(data.scheduledDate)) {
        throw new ApiError('Scheduled date cannot be in the past. Please select today or a future date.', 400);
      }

      const requestId = uuidv4();
      const now = new Date();

      // **SMART AUTO-FILL LOGIC**
      // Auto-assign maintenance team from equipment if not provided
      let teamId = data.teamId || equipment.maintenance_team_id || null;

      // Try database first
      try {
        const sql = `INSERT INTO maintenance_requests 
                     (id, subject, description, type, priority, status, equipment_id, 
                      team_id, assigned_to, scheduled_date, notes, created_by, 
                      created_at, updated_at)
                     VALUES (?, ?, ?, ?, ?, 'NEW', ?, ?, ?, ?, ?, ?, ?, ?)`;

        await db.query(sql, [
          requestId,
          data.subject,
          data.description,
          data.type,
          data.priority || 'MEDIUM',
          data.equipmentId,
          teamId,
          null, // assigned_to - will be assigned by team
          data.scheduledDate || null,
          data.notes || null,
          createdBy,
          now,
          now,
        ]);

        return await this.getMaintenanceRequestById(requestId);
      } catch (dbError) {
        console.warn('[MaintenanceRequestService] Database unavailable, using demo storage');
        // Fallback to demo storage
        const request = {
          id: requestId,
          subject: data.subject,
          description: data.description,
          type: data.type,
          priority: data.priority || 'MEDIUM',
          status: 'NEW',
          equipment_id: data.equipmentId,
          team_id: teamId,
          assigned_to: null,
          scheduled_date: data.scheduledDate || null,
          notes: data.notes || null,
          created_by: createdBy,
          created_at: now,
          updated_at: now,
          equipment_name: equipment.name,
          serial_number: equipment.serial_number,
        };
        demoStorage.saveMaintenanceRequest(request);
        return request;
      }
    } catch (error) {
      if (error.isCustom) throw error;
      console.error('[MaintenanceRequestService] Create error:', error);
      throw new ApiError('Failed to create maintenance request', 500);
    }
  }

  /**
   * Get all maintenance requests
   */
  async getAllMaintenanceRequests(filters = {}) {
    try {
      try {
        let sql = `SELECT * FROM maintenance_requests WHERE 1=1`;
        const params = [];

        if (filters.status) {
          sql += ` AND status = ?`;
          params.push(filters.status);
        }

        if (filters.equipmentId) {
          sql += ` AND equipment_id = ?`;
          params.push(filters.equipmentId);
        }

        if (filters.teamId) {
          sql += ` AND team_id = ?`;
          params.push(filters.teamId);
        }

        if (filters.type) {
          sql += ` AND type = ?`;
          params.push(filters.type);
        }

        if (filters.priority) {
          sql += ` AND priority = ?`;
          params.push(filters.priority);
        }

        sql += ` ORDER BY priority DESC, created_at DESC`;

        return await db.query(sql, params);
      } catch (dbError) {
        console.warn('[MaintenanceRequestService] Database unavailable, using demo storage');
        // Fallback to demo storage
        return demoStorage.getAllMaintenanceRequests();
      }
    } catch (error) {
      console.error('[MaintenanceRequestService] GetAll error:', error);
      throw new ApiError('Failed to retrieve maintenance requests', 500);
    }
  }

  /**
   * Get maintenance request by ID
   */
  async getMaintenanceRequestById(id) {
    try {
      try {
        const sql = `SELECT * FROM maintenance_requests WHERE id = ?`;
        const results = await db.query(sql, [id]);

        if (results.length === 0) {
          throw new ApiError('Maintenance request not found', 404);
        }

        return results[0];
      } catch (dbError) {
        // Check demo storage
        const demoRequest = demoStorage.getMaintenanceRequestById(id);
        if (demoRequest) {
          return demoRequest;
        }
        throw new ApiError('Maintenance request not found', 404);
      }
    } catch (error) {
      if (error.isCustom) throw error;
      console.error('[MaintenanceRequestService] GetById error:', error);
      throw new ApiError('Failed to retrieve maintenance request', 500);
    }
  }

  /**
   * Update maintenance request
   */
  async updateMaintenanceRequest(id, data) {
    try {
      const request = await this.getMaintenanceRequestById(id);

      // Validate date if provided
      if (data.scheduledDate && isPastDate(data.scheduledDate)) {
        throw new ApiError('Scheduled date cannot be in the past', 400);
      }

      const updateFields = [];
      const values = [];

      if (data.subject !== undefined) {
        updateFields.push('subject = ?');
        values.push(data.subject);
      }

      if (data.description !== undefined) {
        updateFields.push('description = ?');
        values.push(data.description);
      }

      if (data.type !== undefined) {
        updateFields.push('type = ?');
        values.push(data.type);
      }

      if (data.priority !== undefined) {
        updateFields.push('priority = ?');
        values.push(data.priority);
      }

      if (data.equipmentId !== undefined) {
        updateFields.push('equipment_id = ?');
        values.push(data.equipmentId);
      }

      if (data.teamId !== undefined) {
        updateFields.push('team_id = ?');
        values.push(data.teamId);
      }

      if (data.assignedTo !== undefined) {
        updateFields.push('assigned_to = ?');
        values.push(data.assignedTo);
      }

      if (data.scheduledDate !== undefined) {
        updateFields.push('scheduled_date = ?');
        values.push(data.scheduledDate);
      }

      if (data.notes !== undefined) {
        updateFields.push('notes = ?');
        values.push(data.notes);
      }

      if (updateFields.length === 0) {
        return request;
      }

      updateFields.push('updated_at = ?');
      values.push(new Date());
      values.push(id);

      const sql = `UPDATE maintenance_requests SET ${updateFields.join(', ')} WHERE id = ?`;
      await db.query(sql, values);

      return await this.getMaintenanceRequestById(id);
    } catch (error) {
      if (error.isCustom) throw error;
      console.error('[MaintenanceRequestService] Update error:', error);
      throw new ApiError('Failed to update maintenance request', 500);
    }
  }

  /**
   * **KANBAN STATUS UPDATE - ENFORCES VALID TRANSITIONS**
   * Valid transitions:
   * NEW → IN_PROGRESS
   * NEW → SCRAP
   * IN_PROGRESS → REPAIRED
   * IN_PROGRESS → SCRAP
   */
  async updateStatus(id, newStatus) {
    try {
      const request = await this.getMaintenanceRequestById(id);
      const currentStatus = request.status;

      // Define valid status transitions
      const validTransitions = {
        NEW: ['IN_PROGRESS', 'SCRAP'],
        IN_PROGRESS: ['REPAIRED', 'SCRAP'],
        REPAIRED: [], // No transitions from REPAIRED
        SCRAP: [], // No transitions from SCRAP
      };

      // Check if transition is valid
      if (!validTransitions[currentStatus] || !validTransitions[currentStatus].includes(newStatus)) {
        throw new ApiError(
          `Invalid status transition from ${currentStatus} to ${newStatus}. Valid transitions: ${validTransitions[currentStatus].join(', ') || 'None'}`,
          400
        );
      }

      // If status is SCRAP, mark equipment as scrapped
      if (newStatus === 'SCRAP') {
        await EquipmentService.scrapEquipment(request.equipment_id);
      }

      const completedDate = newStatus === 'REPAIRED' ? new Date() : null;

      const sql = `UPDATE maintenance_requests 
                   SET status = ?, completed_date = ?, updated_at = ? 
                   WHERE id = ?`;
      await db.query(sql, [newStatus, completedDate, new Date(), id]);

      return await this.getMaintenanceRequestById(id);
    } catch (error) {
      if (error.isCustom) throw error;
      console.error('[MaintenanceRequestService] Update status error:', error);
      throw new ApiError('Failed to update maintenance request status', 500);
    }
  }

  /**
   * **CALENDAR LOGIC - PREVENTIVE MAINTENANCE ONLY**
   * Returns all PREVENTIVE maintenance requests for a specific month/year
   * Strictly validates no past dates
   */
  async getCalendar(month, year) {
    try {
      if (month < 1 || month > 12) {
        throw new ApiError('Invalid month. Must be between 1 and 12', 400);
      }

      if (year < 2020) {
        throw new ApiError('Invalid year', 400);
      }

      // Get first and last day of month
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      // Format dates as YYYY-MM-DD
      const start = startDate.toISOString().split('T')[0];
      const end = endDate.toISOString().split('T')[0];

      try {
        const sql = `SELECT mr.*, e.name as equipment_name, e.serial_number, t.name as team_name
                     FROM maintenance_requests mr
                     LEFT JOIN equipment e ON mr.equipment_id = e.id
                     LEFT JOIN maintenance_teams t ON mr.team_id = t.id
                     WHERE mr.type = 'PREVENTIVE' 
                     AND mr.scheduled_date >= ? 
                     AND mr.scheduled_date <= ?
                     AND mr.status != 'SCRAP'
                     ORDER BY mr.scheduled_date ASC`;

        const results = await db.query(sql, [start, end]);

        // Additional validation: filter out any past dates (shouldn't exist, but safety check)
        const validResults = results.filter(r => !isPastDate(r.scheduled_date));

        return {
          month,
          year,
          count: validResults.length,
          requests: validResults,
        };
      } catch (dbError) {
        console.warn('[MaintenanceRequestService] Database unavailable for calendar, returning empty response');
        // Fallback to empty response when database is unavailable
        return {
          month,
          year,
          count: 0,
          requests: [],
        };
      }
    } catch (error) {
      if (error.isCustom) throw error;
      console.error('[MaintenanceRequestService] Calendar error:', error);
      throw new ApiError('Failed to retrieve calendar', 500);
    }
  }

  /**
   * Get maintenance request by equipment ID
   */
  async getMaintenanceRequestsByEquipment(equipmentId) {
    try {
      const sql = `SELECT * FROM maintenance_requests 
                   WHERE equipment_id = ? 
                   AND status NOT IN ('REPAIRED', 'SCRAP')
                   ORDER BY created_at DESC`;
      return await db.query(sql, [equipmentId]);
    } catch (error) {
      console.error('[MaintenanceRequestService] Get by equipment error:', error);
      throw new ApiError('Failed to retrieve maintenance requests', 500);
    }
  }

  /**
   * Delete maintenance request (only if NEW status)
   */
  async deleteMaintenanceRequest(id) {
    try {
      const request = await this.getMaintenanceRequestById(id);

      if (request.status !== 'NEW') {
        throw new ApiError('Can only delete maintenance requests with NEW status', 400);
      }

      await db.query(`DELETE FROM maintenance_requests WHERE id = ?`, [id]);

      return { message: 'Maintenance request deleted successfully' };
    } catch (error) {
      if (error.isCustom) throw error;
      console.error('[MaintenanceRequestService] Delete error:', error);
      throw new ApiError('Failed to delete maintenance request', 500);
    }
  }
}

module.exports = new MaintenanceRequestService();
