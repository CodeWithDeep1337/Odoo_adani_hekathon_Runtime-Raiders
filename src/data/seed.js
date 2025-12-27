/**
 * Seeder Script
 * Populates the database with initial data
 */

require('dotenv').config();
const { query, end } = require('../config/database');
const seedData = require('./seedData');
const EquipmentRepository = require('../repositories/EquipmentRepository');
const MaintenanceTeamRepository = require('../repositories/MaintenanceTeamRepository');
const MaintenanceRequestRepository = require('../repositories/MaintenanceRequestRepository');
const SystemLogsRepository = require('../repositories/SystemLogsRepository');

async function seed() {
  try {
    console.log('🌱 Starting database seed...');

    // Clear existing data
    console.log('Cleaning up old data...');
    await query('DELETE FROM system_logs');
    await query('DELETE FROM maintenance_requests');
    await query('DELETE FROM technicians');
    await query('DELETE FROM maintenance_teams');
    await query('DELETE FROM equipment');

    // Seed Teams
    console.log(`Seeding ${seedData.maintenanceTeams.length} teams...`);
    for (const team of seedData.maintenanceTeams) {
        // Create team first
        await MaintenanceTeamRepository.create({
            teamName: team.teamName,
            id: team.id // Preserve ID
        });
        
        // Add technicians
        for (const techId of team.technicians) {
            await MaintenanceTeamRepository.addTechnician(team.id, techId);
        }
    }

    // Seed Equipment
    console.log(`Seeding ${seedData.equipment.length} equipment...`);
    for (const eq of seedData.equipment) {
      await EquipmentRepository.create({
          id: eq.id,
          equipmentName: eq.equipmentName,
          serialNumber: eq.serialNumber,
          category: eq.category,
          purchaseDate: eq.purchaseDate,
          warrantyExpiry: eq.warrantyExpiry,
          department: eq.department,
          assignedEmployee: eq.assignedEmployee,
          maintenanceTeamId: eq.maintenanceTeamId, // Should match team IDs above
          location: eq.location,
          isScrapped: eq.isScrapped
      });
    }

    // Seed Maintenance Requests
    console.log(`Seeding ${seedData.maintenanceRequests.length} requests...`);
    for (const req of seedData.maintenanceRequests) {
        // We use create which sets New stage. If we want to force seed state, we might need direct insert or update.
        // Let's create then update.
        
        // Construct create data
        const createData = {
            id: req.id,
            subject: req.subject,
            requestType: req.requestType,
            equipmentId: req.equipmentId,
            category: req.category,
            maintenanceTeamId: req.maintenanceTeamId,
            assignedTechnicianId: req.assignedTechnicianId,
            scheduledDate: req.scheduledDate,
            stage: req.stage, // Repo create handles stage if passed? Model sets default NEW. Repo uses spread.
            // My Repo create:
            // const model = new MaintenanceRequest(data);
            // INSERT ...
            // Model constructor sets stage to NEW if not provided.
            // If provided, it uses it.
            // So passing stage should work.
            completedAt: req.completedAt,
            durationHours: req.durationHours
        };

        await MaintenanceRequestRepository.create(createData);
    }
    
    // Seed Logs (Optional, but good for history)
    console.log(`Seeding ${seedData.systemLogs.length} logs...`);
    for (const log of seedData.systemLogs) {
        // Using direct query to preserve ID and timestamp.
        // Repo.createLog generates new ID and NOW().
        const sql = `
            INSERT INTO system_logs (id, action, entity, entity_id, details, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        await query(sql, [
            log.id,
            log.action,
            log.entity,
            log.entityId,
            JSON.stringify(log.details),
            log.timestamp
        ]);
    }

    console.log('✅ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    process.exit();
  }
}

seed();
