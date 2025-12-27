/**
 * Maintenance Request Repository
 * Database access layer for Maintenance Requests
 */

const { query } = require('../config/database');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const { MAINTENANCE_STAGES, REQUEST_TYPES } = require('../config/constants');

class MaintenanceRequestRepository {
  /**
   * Helper to map DB result to Model
   */
  _mapToModel(row) {
    if (!row) return null;
    const request = new MaintenanceRequest({
      id: row.id,
      subject: row.subject,
      requestType: row.request_type,
      equipmentId: row.equipment_id,
      assignedTechnicianId: row.assigned_technician_id,
      maintenanceTeamId: row.maintenance_team_id, // Note: This might need a Join to get from Equipment?? 
      // WAIT. Schema for maintenance_requests DOES NOT have maintenance_team_id. 
      // It is on Equipment. 
      // The Model Expects it? 
      // Let's check Model.js. 
      // Model has `this.maintenanceTeamId = data.maintenanceTeamId; // Auto-filled from equipment`
      // So when fetching a Request, we might need to JOIN equipment to get the team_id if the Model needs it.
      // Or we accept it might be null if we don't join.
      // Let's doing a JOIN to be safe as the Application seems to rely on it.
      
      scheduledDate: row.scheduled_date,
      durationHours: row.duration_hours,
      stage: row.stage,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      completedAt: row.completed_at
    });
    
    // If we joined and got team_id, set it.
    if (row.maintenance_team_id) {
        request.maintenanceTeamId = row.maintenance_team_id;
    }
    
    // Also category
    if (row.category) {
        request.category = row.category;
    }

    request.calculateOverdue();
    return request;
  }
  
  // Helper for base select with joins to get equipment details (team, category)
  _getBaseSelect() {
      return `
        SELECT mr.*, e.maintenance_team_id, e.category 
        FROM maintenance_requests mr
        LEFT JOIN equipment e ON mr.equipment_id = e.id
      `;
  }

  /**
   * Create new request
   */
  async create(requestData) {
    const request = new MaintenanceRequest(requestData);
    const sql = `
      INSERT INTO maintenance_requests (
        id, subject, request_type, equipment_id, assigned_technician_id,
        scheduled_date, duration_hours, stage, created_at, updated_at, completed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      request.id,
      request.subject,
      request.requestType,
      request.equipmentId,
      request.assignedTechnicianId,
      request.scheduledDate,
      request.durationHours,
      request.stage,
      request.createdAt,
      request.updatedAt,
      request.completedAt
    ];

    await query(sql, params);
    return request;
  }

  /**
   * Get request by ID
   */
  async findById(id) {
    const sql = `${this._getBaseSelect()} WHERE mr.id = ?`;
    const rows = await query(sql, [id]);
    return this._mapToModel(rows[0]);
  }

  /**
   * Get all requests
   */
  async findAll() {
    const sql = `${this._getBaseSelect()} ORDER BY mr.created_at DESC`;
    const rows = await query(sql);
    return rows.map(row => this._mapToModel(row));
  }

  /**
   * Get requests by equipment
   */
  async findByEquipment(equipmentId) {
    const sql = `${this._getBaseSelect()} WHERE mr.equipment_id = ?`;
    const rows = await query(sql, [equipmentId]);
    return rows.map(row => this._mapToModel(row));
  }

  /**
   * Get requests by team
   */
  async findByTeam(teamId) {
    const sql = `${this._getBaseSelect()} WHERE e.maintenance_team_id = ?`;
    const rows = await query(sql, [teamId]);
    return rows.map(row => this._mapToModel(row));
  }

  /**
   * Get requests by technician
   */
  async findByTechnician(technicianId) {
    const sql = `${this._getBaseSelect()} WHERE mr.assigned_technician_id = ?`;
    const rows = await query(sql, [technicianId]);
    return rows.map(row => this._mapToModel(row));
  }

  /**
   * Get requests by stage
   */
  async findByStage(stage) {
    const sql = `${this._getBaseSelect()} WHERE mr.stage = ?`;
    const rows = await query(sql, [stage]);
    return rows.map(row => this._mapToModel(row));
  }

  /**
   * Get requests by type
   */
  async findByType(type) {
    const sql = `${this._getBaseSelect()} WHERE mr.request_type = ?`;
    const rows = await query(sql, [type]);
    return rows.map(row => this._mapToModel(row));
  }

  /**
   * Get open requests
   */
  async findOpenRequests() {
    const sql = `${this._getBaseSelect()} WHERE mr.stage NOT IN (?, ?)`;
    const rows = await query(sql, [MAINTENANCE_STAGES.REPAIRED, MAINTENANCE_STAGES.SCRAP]);
    return rows.map(row => this._mapToModel(row));
  }

  /**
   * Get closed requests
   */
  async findClosedRequests() {
    const sql = `${this._getBaseSelect()} WHERE mr.stage IN (?, ?)`;
    const rows = await query(sql, [MAINTENANCE_STAGES.REPAIRED, MAINTENANCE_STAGES.SCRAP]);
    return rows.map(row => this._mapToModel(row));
  }

  /**
   * Get overdue requests
   * Logic: Preventive AND Scheduled Date < Today AND Not Closed
   */
  async findOverdueRequests() {
    // We can do this in SQL or Application.
    // SQL is better.
    const sql = `
        ${this._getBaseSelect()} 
        WHERE mr.request_type = ? 
        AND mr.scheduled_date < CURDATE() 
        AND mr.stage NOT IN (?, ?)
    `;
    const rows = await query(sql, [
        REQUEST_TYPES.PREVENTIVE, 
        MAINTENANCE_STAGES.REPAIRED, 
        MAINTENANCE_STAGES.SCRAP
    ]);
    return rows.map(row => this._mapToModel(row));
  }

  /**
   * Update request
   */
  async update(id, updateData) {
    const dbMap = {
      subject: 'subject',
      requestType: 'request_type',
      equipmentId: 'equipment_id',
      assignedTechnicianId: 'assigned_technician_id',
      scheduledDate: 'scheduled_date',
      durationHours: 'duration_hours',
      stage: 'stage',
      completedAt: 'completed_at'
    };

    const sets = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (dbMap[key]) {
        sets.push(`${dbMap[key]} = ?`);
        values.push(updateData[key]);
      }
    });

    if (sets.length === 0) return await this.findById(id);

    sets.push('updated_at = NOW()');
    
    const sql = `UPDATE maintenance_requests SET ${sets.join(', ')} WHERE id = ?`;
    values.push(id);

    await query(sql, values);
    return await this.findById(id);
  }

  /**
   * Delete request
   */
  async delete(id) {
    const sql = 'DELETE FROM maintenance_requests WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  /**
   * Check if request exists
   */
  async exists(id) {
    const sql = 'SELECT 1 FROM maintenance_requests WHERE id = ?';
    const rows = await query(sql, [id]);
    return rows.length > 0;
  }

  /**
   * Count total requests
   */
  async count() {
    const sql = 'SELECT COUNT(*) as total FROM maintenance_requests';
    const rows = await query(sql);
    return rows[0].total;
  }

  /**
   * Count requests by stage
   */
  async countByStage(stage) {
    const sql = 'SELECT COUNT(*) as total FROM maintenance_requests WHERE stage = ?';
    const rows = await query(sql, [stage]);
    return rows[0].total;
  }

  /**
   * Get preventive requests by date range
   */
  async findPreventiveByDateRange(startDate, endDate) {
    const sql = `
        ${this._getBaseSelect()} 
        WHERE mr.request_type = ? 
        AND mr.scheduled_date BETWEEN ? AND ?
    `;
    const rows = await query(sql, [REQUEST_TYPES.PREVENTIVE, startDate, endDate]);
    return rows.map(row => this._mapToModel(row));
  }
}

module.exports = new MaintenanceRequestRepository();
