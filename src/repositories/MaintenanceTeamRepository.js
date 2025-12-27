/**
 * Maintenance Team Repository
 * Database access layer for Maintenance Teams
 */

const { query } = require('../config/database');
const MaintenanceTeam = require('../models/MaintenanceTeam');

class MaintenanceTeamRepository {
  /**
   * Helper to map DB result to Model
   */
  async _mapToModel(row) {
    if (!row) return null;
    
    // Fetch technicians for this team
    const techSql = 'SELECT id FROM technicians WHERE team_id = ?';
    const techRows = await query(techSql, [row.id]);
    const technicianIds = techRows.map(t => t.id);

    return new MaintenanceTeam({
      id: row.id,
      teamName: row.team_name,
      technicians: technicianIds,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  }

  /**
   * Create new team
   */
  async create(teamData) {
    const team = new MaintenanceTeam(teamData);
    const sql = `
      INSERT INTO maintenance_teams (id, team_name, created_at, updated_at) 
      VALUES (?, ?, ?, ?)
    `;
    const params = [
      team.id,
      team.teamName,
      team.createdAt,
      team.updatedAt
    ];

    await query(sql, params);
    
    // If technicians provided, update them
    if (team.technicians && team.technicians.length > 0) {
      for (const techId of team.technicians) {
        await this.addTechnician(team.id, techId);
      }
    }
    
    return team;
  }

  /**
   * Get team by ID
   */
  async findById(id) {
    const sql = 'SELECT * FROM maintenance_teams WHERE id = ?';
    const rows = await query(sql, [id]);
    if (rows.length === 0) return null;
    return await this._mapToModel(rows[0]);
  }

  /**
   * Get all teams
   */
  async findAll() {
    const sql = 'SELECT * FROM maintenance_teams ORDER BY created_at DESC';
    const rows = await query(sql);
    
    // Map concurrently
    return await Promise.all(rows.map(row => this._mapToModel(row)));
  }

  /**
   * Get teams by technician
   */
  async findByTechnician(technicianId) {
    // A technician belongs to ONE team in our schema (team_id on technicians table).
    // So we find the team where this technician resides.
    const sql = `
      SELECT t.* FROM maintenance_teams t
      JOIN technicians tech ON tech.team_id = t.id
      WHERE tech.id = ?
    `;
    const rows = await query(sql, [technicianId]);
    return await Promise.all(rows.map(row => this._mapToModel(row)));
  }

  /**
   * Update team
   */
  async update(id, updateData) {
    const dbMap = {
      teamName: 'team_name'
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
    
    const sql = `UPDATE maintenance_teams SET ${sets.join(', ')} WHERE id = ?`;
    values.push(id);

    await query(sql, values);
    return await this.findById(id);
  }

  /**
   * Delete team
   */
  async delete(id) {
    const sql = 'DELETE FROM maintenance_teams WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  /**
   * Check if team exists
   */
  async exists(id) {
    const sql = 'SELECT 1 FROM maintenance_teams WHERE id = ?';
    const rows = await query(sql, [id]);
    return rows.length > 0;
  }

  /**
   * Add technician to team
   */
  async addTechnician(teamId, technicianId) {
    // We update the technician's team_id
    // First safely check if technician exists? Assume exists or handled by FK constraint error.
    // If technician doesn't exist, UPDATE will affect 0 rows.
    
    // Ideally we should create the technician if they don't exist? 
    // The current In-Memory logic assumed Technicians were just IDs.
    // In SQL, Technicians are records.
    // I should probably INSERT IGNORE or Check if exists first.
    // For now, let's assume we are Assigning an existing technician.
    
    const sql = 'UPDATE technicians SET team_id = ? WHERE id = ?';
    const result = await query(sql, [teamId, technicianId]);
    
    // If no rows affected, maybe technician doesn't exist. 
    // In the in-memory version, we just pushed the ID string.
    // If the technician ID is just a string without a record in 'technicians', this fails FK if we are strict.
    // The schema `request` -> `technicians` FK suggests technicians MUST exist.
    // So we should Ensure technician exists. 
    
    if (result.affectedRows === 0) {
       // Check if technician exists
       const check = await query('SELECT 1 FROM technicians WHERE id = ?', [technicianId]);
       if (check.length === 0) {
           // Auto-create technician if missing (Migrating behavior)
           await query('INSERT INTO technicians (id, name, team_id) VALUES (?, ?, ?)', [technicianId, 'Unknown Technician', teamId]);
           return true; 
       }
       return false; // Technicians exists but update failed? Unlikely unless team_id match.
    }
    return true;
  }

  /**
   * Remove technician from team
   */
  async removeTechnician(teamId, technicianId) {
    const sql = 'UPDATE technicians SET team_id = NULL WHERE id = ? AND team_id = ?';
    const result = await query(sql, [technicianId, teamId]);
    return result.affectedRows > 0;
  }

  /**
   * Count total teams
   */
  async count() {
    const sql = 'SELECT COUNT(*) as total FROM maintenance_teams';
    const rows = await query(sql);
    return rows[0].total;
  }
}

module.exports = new MaintenanceTeamRepository();
