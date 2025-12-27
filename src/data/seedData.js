/**
 * Seed Data
 * Test data for development and testing
 */

const Equipment = require('../models/Equipment');
const MaintenanceTeam = require('../models/MaintenanceTeam');
const MaintenanceRequest = require('../models/MaintenanceRequest');

const seedData = {
  equipment: [
    new Equipment({
      id: 'EQP-00001',
      equipmentName: 'CNC Lathe Machine',
      serialNumber: 'CNC-2021-001',
      category: 'Machinery',
      purchaseDate: '2021-03-15',
      warrantyExpiry: '2024-03-15',
      department: 'Production',
      assignedEmployee: 'EMP-001',
      maintenanceTeamId: 'TEAM-0001',
      location: 'Floor 1, Station A',
      isScrapped: false,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }),
    new Equipment({
      id: 'EQP-00002',
      equipmentName: 'Hydraulic Press',
      serialNumber: 'HYD-2020-045',
      category: 'Hydraulic',
      purchaseDate: '2020-06-20',
      warrantyExpiry: '2023-06-20',
      department: 'Manufacturing',
      assignedEmployee: 'EMP-002',
      maintenanceTeamId: 'TEAM-0001',
      location: 'Floor 2, Station B',
      isScrapped: false,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }),
    new Equipment({
      id: 'EQP-00003',
      equipmentName: 'Industrial Drill Press',
      serialNumber: 'DRILL-2022-078',
      category: 'Machinery',
      purchaseDate: '2022-01-10',
      warrantyExpiry: '2025-01-10',
      department: 'Production',
      assignedEmployee: 'EMP-001',
      maintenanceTeamId: 'TEAM-0002',
      location: 'Floor 1, Station C',
      isScrapped: false,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }),
    new Equipment({
      id: 'EQP-00004',
      equipmentName: 'Air Compressor',
      serialNumber: 'COMP-2021-056',
      category: 'Pneumatic',
      purchaseDate: '2021-05-15',
      warrantyExpiry: '2024-05-15',
      department: 'Utilities',
      assignedEmployee: null,
      maintenanceTeamId: 'TEAM-0002',
      location: 'Floor 0, Utility Room',
      isScrapped: false,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }),
    new Equipment({
      id: 'EQP-00005',
      equipmentName: 'Safety Harness Kit',
      serialNumber: 'SAFETY-2023-120',
      category: 'Safety Equipment',
      purchaseDate: '2023-02-28',
      warrantyExpiry: '2026-02-28',
      department: 'Safety',
      assignedEmployee: null,
      maintenanceTeamId: null,
      location: 'Storage Room',
      isScrapped: false,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    })
  ],

  maintenanceTeams: [
    new MaintenanceTeam({
      id: 'TEAM-0001',
      teamName: 'Mechanical Maintenance Team',
      technicians: ['TECH-001', 'TECH-002', 'TECH-003'],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }),
    new MaintenanceTeam({
      id: 'TEAM-0002',
      teamName: 'Electrical Maintenance Team',
      technicians: ['TECH-004', 'TECH-005'],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }),
    new MaintenanceTeam({
      id: 'TEAM-0003',
      teamName: 'Hydraulics & Pneumatics Team',
      technicians: ['TECH-006', 'TECH-007'],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    })
  ],

  maintenanceRequests: [
    new MaintenanceRequest({
      id: 'REQ-000001',
      subject: 'CNC Lathe - Spindle Bearing Issue',
      requestType: 'Corrective',
      equipmentId: 'EQP-00001',
      category: 'Machinery',
      maintenanceTeamId: 'TEAM-0001',
      assignedTechnicianId: 'TECH-001',
      scheduledDate: null,
      durationHours: null,
      stage: 'In Progress',
      overdue: false,
      createdAt: '2024-12-20',
      updatedAt: '2024-12-25',
      completedAt: null
    }),
    new MaintenanceRequest({
      id: 'REQ-000002',
      subject: 'Hydraulic Press - Pressure Testing',
      requestType: 'Preventive',
      equipmentId: 'EQP-00002',
      category: 'Hydraulic',
      maintenanceTeamId: 'TEAM-0001',
      assignedTechnicianId: 'TECH-002',
      scheduledDate: '2025-01-15',
      durationHours: null,
      stage: 'New',
      overdue: false,
      createdAt: '2024-12-18',
      updatedAt: '2024-12-18',
      completedAt: null
    }),
    new MaintenanceRequest({
      id: 'REQ-000003',
      subject: 'Industrial Drill - Calibration Check',
      requestType: 'Preventive',
      equipmentId: 'EQP-00003',
      category: 'Machinery',
      maintenanceTeamId: 'TEAM-0002',
      assignedTechnicianId: null,
      scheduledDate: '2024-12-25',
      durationHours: null,
      stage: 'New',
      overdue: true,
      createdAt: '2024-12-10',
      updatedAt: '2024-12-10',
      completedAt: null
    }),
    new MaintenanceRequest({
      id: 'REQ-000004',
      subject: 'Air Compressor - Filter Replacement',
      requestType: 'Preventive',
      equipmentId: 'EQP-00004',
      category: 'Pneumatic',
      maintenanceTeamId: 'TEAM-0002',
      assignedTechnicianId: 'TECH-005',
      scheduledDate: '2025-01-10',
      durationHours: null,
      stage: 'New',
      overdue: false,
      createdAt: '2024-12-22',
      updatedAt: '2024-12-22',
      completedAt: null
    }),
    new MaintenanceRequest({
      id: 'REQ-000005',
      subject: 'CNC Lathe - Oil Change',
      requestType: 'Corrective',
      equipmentId: 'EQP-00001',
      category: 'Machinery',
      maintenanceTeamId: 'TEAM-0001',
      assignedTechnicianId: 'TECH-003',
      scheduledDate: null,
      durationHours: 2,
      stage: 'Repaired',
      overdue: false,
      createdAt: '2024-12-15',
      updatedAt: '2024-12-26',
      completedAt: '2024-12-26'
    })
  ],

  systemLogs: [
    {
      id: 'LOG-0000001',
      action: 'CREATE',
      entity: 'EQUIPMENT',
      entityId: 'EQP-00001',
      details: { equipmentName: 'CNC Lathe Machine', category: 'Machinery' },
      timestamp: '2024-01-01T00:00:00.000Z'
    },
    {
      id: 'LOG-0000002',
      action: 'CREATE',
      entity: 'TEAM',
      entityId: 'TEAM-0001',
      details: { teamName: 'Mechanical Maintenance Team' },
      timestamp: '2024-01-01T00:00:00.000Z'
    },
    {
      id: 'LOG-0000003',
      action: 'CREATE_REQUEST',
      entity: 'REQUEST',
      entityId: 'REQ-000001',
      details: { requestType: 'Corrective', equipmentId: 'EQP-00001', equipmentName: 'CNC Lathe Machine' },
      timestamp: '2024-12-20T10:30:00.000Z'
    }
  ]
};

module.exports = seedData;
