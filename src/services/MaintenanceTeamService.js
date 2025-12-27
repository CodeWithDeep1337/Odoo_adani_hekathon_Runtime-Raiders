/**
 * Maintenance Team Service
 * Business logic for maintenance team management
 */

const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { ApiError } = require('../middleware/errorHandler');

class MaintenanceTeamService {
  /**
   * Create new team
   */
  async createTeam(data) {
    try {
      const teamId = uuidv4();
      const now = new Date();

      const sql = `INSERT INTO maintenance_teams 
                   (id, name, lead, description, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?)`;

      await db.query(sql, [
        teamId,
        data.name,
        data.lead,
        data.description || null,
        now,
        now,
      ]);

      return await this.getTeamById(teamId);
    } catch (error) {
      console.error('[MaintenanceTeamService] Create error:', error);
      throw new ApiError('Failed to create team', 500);
    }
  }

  /**
   * Get all teams
   */
  async getAllTeams(filters = {}) {
    try {
      let sql = `SELECT * FROM maintenance_teams WHERE 1=1`;
      const params = [];

      if (filters.name) {
        sql += ` AND name LIKE ?`;
        params.push(`%${filters.name}%`);
      }

      sql += ` ORDER BY created_at DESC`;

      return await db.query(sql, params);
    } catch (error) {
      console.error('[MaintenanceTeamService] GetAll error:', error);
      throw new ApiError('Failed to retrieve teams', 500);
    }
  }

  /**
   * Get team by ID
   */
  async getTeamById(id) {
    try {
      const sql = `SELECT * FROM maintenance_teams WHERE id = ?`;
      const results = await db.query(sql, [id]);

      if (results.length === 0) {
        throw new ApiError('Team not found', 404);
      }

      // Get team members
      const membersSql = `SELECT u.id, u.name, u.email, u.role, tm.role as team_role
                          FROM team_members tm
                          JOIN users u ON tm.member_id = u.id
                          WHERE tm.team_id = ?`;
      const members = await db.query(membersSql, [id]);

      return {
        ...results[0],
        members,
      };
    } catch (error) {
      if (error.isCustom) throw error;
      console.error('[MaintenanceTeamService] GetById error:', error);
      throw new ApiError('Failed to retrieve team', 500);
    }
  }

  /**
   * Update team
   */
  async updateTeam(id, data) {
    try {
      const team = await this.getTeamById(id);

      const updateFields = [];
      const values = [];

      if (data.name !== undefined) {
        updateFields.push('name = ?');
        values.push(data.name);
      }

      if (data.lead !== undefined) {
        updateFields.push('lead = ?');
        values.push(data.lead);
      }

      if (data.description !== undefined) {
        updateFields.push('description = ?');
        values.push(data.description);
      }

      if (updateFields.length === 0) {
        return team;
      }

      updateFields.push('updated_at = ?');
      values.push(new Date());
      values.push(id);

      const sql = `UPDATE maintenance_teams SET ${updateFields.join(', ')} WHERE id = ?`;
      await db.query(sql, values);

      return await this.getTeamById(id);
    } catch (error) {
      if (error.isCustom) throw error;
      console.error('[MaintenanceTeamService] Update error:', error);
      throw new ApiError('Failed to update team', 500);
    }
  }

  /**
   * Delete team
   */
  async deleteTeam(id) {
    try {
      const team = await this.getTeamById(id);

      // Check if team has active maintenance requests
      const activeRequests = await db.query(
        `SELECT COUNT(*) as count FROM maintenance_requests 
         WHERE team_id = ? AND status != 'REPAIRED' AND status != 'SCRAP'`,
        [id]
      );

      if (activeRequests[0].count > 0) {
        throw new ApiError(
          'Cannot delete team with active maintenance requests',
          400
        );
      }

      // Delete team members
      await db.query(`DELETE FROM team_members WHERE team_id = ?`, [id]);

      // Delete team
      await db.query(`DELETE FROM maintenance_teams WHERE id = ?`, [id]);

      return { message: 'Team deleted successfully' };
    } catch (error) {
      if (error.isCustom) throw error;
      console.error('[MaintenanceTeamService] Delete error:', error);
      throw new ApiError('Failed to delete team', 500);
    }
  }

  /**
   * Add member to team
   */
  async addTeamMember(teamId, userId, memberRole = 'TECHNICIAN') {
    try {
      // Verify team exists
      await this.getTeamById(teamId);

      // Check if member already exists
      const existing = await db.query(
        `SELECT id FROM team_members WHERE team_id = ? AND member_id = ?`,
        [teamId, userId]
      );

      if (existing.length > 0) {
        throw new ApiError('User is already a member of this team', 409);
      }

      const memberId = uuidv4();
      const sql = `INSERT INTO team_members (id, team_id, member_id, role, created_at)
                   VALUES (?, ?, ?, ?, ?)`;

      await db.query(sql, [memberId, teamId, userId, memberRole, new Date()]);

      return { message: 'Team member added successfully' };
    } catch (error) {
      if (error.isCustom) throw error;
      console.error('[MaintenanceTeamService] Add member error:', error);
      throw new ApiError('Failed to add team member', 500);
    }
  }

  /**
   * Remove member from team
   */
  async removeTeamMember(teamId, userId) {
    try {
      await db.query(
        `DELETE FROM team_members WHERE team_id = ? AND member_id = ?`,
        [teamId, userId]
      );

      return { message: 'Team member removed successfully' };
    } catch (error) {
      console.error('[MaintenanceTeamService] Remove member error:', error);
      throw new ApiError('Failed to remove team member', 500);
    }
  }

  /**
   * Get team members
   */
  async getTeamMembers(teamId) {
    try {
      const sql = `SELECT u.id, u.name, u.email, u.role, tm.role as team_role
                   FROM team_members tm
                   JOIN users u ON tm.member_id = u.id
                   WHERE tm.team_id = ?
                   ORDER BY u.name ASC`;

      return await db.query(sql, [teamId]);
    } catch (error) {
      console.error('[MaintenanceTeamService] Get members error:', error);
      throw new ApiError('Failed to retrieve team members', 500);
    }
  }
}

module.exports = new MaintenanceTeamService();
