/**
 * System Logs Repository
 * Database access layer for audit logs
 */

const { query } = require('../config/database');
const { generateLogId } = require('../utils/idGenerator');
const { getCurrentDateTime } = require('../utils/dateHelper');

class SystemLogsRepository {
  /**
   * Helper to map DB result
   */
  _mapToModel(row) {
    if (!row) return null;
    return {
      id: row.id,
      action: row.action,
      entity: row.entity,
      entityId: row.entity_id,
      details: typeof row.details === 'string' ? JSON.parse(row.details) : row.details,
      timestamp: row.timestamp
    };
  }

  /**
   * Create new log
   */
  async createLog(action, entity, entityId, details) {
    const log = {
      id: generateLogId(),
      action,
      entity,
      entityId,
      details,
      timestamp: getCurrentDateTime()
    };

    const sql = `
      INSERT INTO system_logs (id, action, entity, entity_id, details, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [
      log.id,
      log.action,
      log.entity,
      log.entityId,
      JSON.stringify(log.details),
      log.timestamp
    ];

    await query(sql, params);
    return log;
  }

  /**
   * Get all logs
   */
  async findAll() {
    const sql = 'SELECT * FROM system_logs ORDER BY timestamp DESC';
    const rows = await query(sql);
    return rows.map(row => this._mapToModel(row));
  }

  /**
   * Get logs by entity
   */
  async findByEntity(entity) {
    const sql = 'SELECT * FROM system_logs WHERE entity = ? ORDER BY timestamp DESC';
    const rows = await query(sql, [entity]);
    return rows.map(row => this._mapToModel(row));
  }

  /**
   * Get logs by entity ID
   */
  async findByEntityId(entityId) {
    const sql = 'SELECT * FROM system_logs WHERE entity_id = ? ORDER BY timestamp DESC';
    const rows = await query(sql, [entityId]);
    return rows.map(row => this._mapToModel(row));
  }

  /**
   * Get logs by action
   */
  async findByAction(action) {
    const sql = 'SELECT * FROM system_logs WHERE action = ? ORDER BY timestamp DESC';
    const rows = await query(sql, [action]);
    return rows.map(row => this._mapToModel(row));
  }

  /**
   * Get recent logs
   */
  async findRecent(limit = 50) {
    const sql = 'SELECT * FROM system_logs ORDER BY timestamp DESC LIMIT ?';
    // Must map limit to integer just in case
    const rows = await query(sql, [Number(limit)]);
    return rows.map(row => this._mapToModel(row));
  }

  /**
   * Count logs
   */
  async count() {
    const sql = 'SELECT COUNT(*) as total FROM system_logs';
    const rows = await query(sql);
    return rows[0].total;
  }

  /**
   * Clear logs (use with caution)
   */
  async clearLogs() {
    const sql = 'TRUNCATE TABLE system_logs';
    await query(sql);
  }
}

module.exports = new SystemLogsRepository();
