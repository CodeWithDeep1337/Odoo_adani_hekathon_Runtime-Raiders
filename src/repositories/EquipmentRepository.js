/**
 * Equipment Repository
 * Database access layer for Equipment
 */

const { query } = require('../config/database');
const Equipment = require('../models/Equipment');

class EquipmentRepository {
  /**
   * Helper to map DB result to Model
   */
  _mapToModel(row) {
    if (!row) return null;
    return new Equipment({
      id: row.id,
      equipmentName: row.name,
      serialNumber: row.serial_number,
      category: row.category,
      purchaseDate: row.purchase_date,
      warrantyExpiry: row.warranty_expiry,
      department: row.department,
      assignedEmployee: row.assigned_employee,
      maintenanceTeamId: row.maintenance_team_id,
      location: row.location,
      isScrapped: Boolean(row.is_scrapped),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  }

  /**
   * Create new equipment
   */
  async create(equipmentData) {
    const equipment = new Equipment(equipmentData);
    const sql = `
      INSERT INTO equipment (
        id, name, serial_number, category, purchase_date, 
        warranty_expiry, department, assigned_employee, 
        maintenance_team_id, location, is_scrapped, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      equipment.id,
      equipment.equipmentName,
      equipment.serialNumber,
      equipment.category,
      equipment.purchaseDate,
      equipment.warrantyExpiry,
      equipment.department,
      equipment.assignedEmployee,
      equipment.maintenanceTeamId,
      equipment.location,
      equipment.isScrapped,
      equipment.createdAt,
      equipment.updatedAt
    ];

    await query(sql, params);
    return equipment;
  }

  /**
   * Get equipment by ID
   */
  async findById(id) {
    const sql = 'SELECT * FROM equipment WHERE id = ?';
    const rows = await query(sql, [id]);
    return this._mapToModel(rows[0]);
  }

  /**
   * Get all equipment
   */
  async findAll() {
    const sql = 'SELECT * FROM equipment ORDER BY created_at DESC';
    const rows = await query(sql);
    return rows.map(row => this._mapToModel(row));
  }

  /**
   * Get equipment by department
   */
  async findByDepartment(department) {
    const sql = 'SELECT * FROM equipment WHERE department = ?';
    const rows = await query(sql, [department]);
    return rows.map(row => this._mapToModel(row));
  }

  /**
   * Get equipment by assigned employee
   */
  async findByAssignedEmployee(employeeId) {
    const sql = 'SELECT * FROM equipment WHERE assigned_employee = ?';
    const rows = await query(sql, [employeeId]);
    return rows.map(row => this._mapToModel(row));
  }

  /**
   * Get equipment by maintenance team
   */
  async findByMaintenanceTeam(teamId) {
    const sql = 'SELECT * FROM equipment WHERE maintenance_team_id = ?';
    const rows = await query(sql, [teamId]);
    return rows.map(row => this._mapToModel(row));
  }

  /**
   * Get equipment by category
   */
  async findByCategory(category) {
    const sql = 'SELECT * FROM equipment WHERE category = ?';
    const rows = await query(sql, [category]);
    return rows.map(row => this._mapToModel(row));
  }

  /**
   * Update equipment
   */
  async update(id, updateData) {
    // We construct the SET clause dynamically
    // Note: This needs mapping from camelCase updateData to snake_case DB columns
    // For simplicity, we assume updateData uses model keys, so we map them
    
    const dbMap = {
      equipmentName: 'name',
      serialNumber: 'serial_number',
      category: 'category',
      purchaseDate: 'purchase_date',
      warrantyExpiry: 'warranty_expiry',
      department: 'department',
      assignedEmployee: 'assigned_employee',
      maintenanceTeamId: 'maintenance_team_id',
      location: 'location',
      isScrapped: 'is_scrapped'
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

    const sql = `UPDATE equipment SET ${sets.join(', ')} WHERE id = ?`;
    values.push(id);

    await query(sql, values);
    return await this.findById(id);
  }

  /**
   * Delete equipment
   */
  async delete(id) {
    const sql = 'DELETE FROM equipment WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  /**
   * Check if equipment exists
   */
  async exists(id) {
    const sql = 'SELECT 1 FROM equipment WHERE id = ?';
    const rows = await query(sql, [id]);
    return rows.length > 0;
  }

  /**
   * Count total equipment
   */
  async count() {
    const sql = 'SELECT COUNT(*) as total FROM equipment';
    const rows = await query(sql);
    return rows[0].total;
  }

  /**
   * Get scrapped equipment
   */
  async findScrapped() {
    const sql = 'SELECT * FROM equipment WHERE is_scrapped = 1';
    const rows = await query(sql);
    return rows.map(row => this._mapToModel(row));
  }

  /**
   * Get active equipment
   */
  async findActive() {
    const sql = 'SELECT * FROM equipment WHERE is_scrapped = 0';
    const rows = await query(sql);
    return rows.map(row => this._mapToModel(row));
  }
}

module.exports = new EquipmentRepository();
