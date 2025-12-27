-- GearGuard Database Schema
-- Production-ready schema with all necessary tables and relationships

-- Users Table (Authentication)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'MANAGER', 'TECHNICIAN', 'USER') DEFAULT 'USER',
    status ENUM('PENDING_VERIFICATION', 'VERIFIED', 'BLOCKED') DEFAULT 'PENDING_VERIFICATION',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_status (status)
);

-- OTP Verification Table
CREATE TABLE IF NOT EXISTS otp_verifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    email VARCHAR(100) NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    otp_type ENUM('EMAIL_VERIFICATION', 'PASSWORD_RESET') DEFAULT 'EMAIL_VERIFICATION',
    attempts INT DEFAULT 0,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_email (email),
    INDEX idx_expires_at (expires_at)
);

-- Refresh Tokens Table
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_token (token),
    INDEX idx_expires_at (expires_at)
);

-- Maintenance Teams Table
CREATE TABLE IF NOT EXISTS maintenance_teams (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    lead VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
);

-- Team Members Table
CREATE TABLE IF NOT EXISTS team_members (
    id VARCHAR(36) PRIMARY KEY,
    team_id VARCHAR(36) NOT NULL,
    member_id VARCHAR(36) NOT NULL,
    role VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES maintenance_teams(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_team_member (team_id, member_id),
    INDEX idx_team_id (team_id),
    INDEX idx_member_id (member_id)
);

-- Equipment Table
CREATE TABLE IF NOT EXISTS equipment (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    assigned_employee VARCHAR(100),
    maintenance_team_id VARCHAR(36),
    purchase_date DATE NOT NULL,
    warranty_end_date DATE NOT NULL,
    location VARCHAR(200) NOT NULL,
    is_scrapped BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (maintenance_team_id) REFERENCES maintenance_teams(id) ON DELETE SET NULL,
    INDEX idx_serial_number (serial_number),
    INDEX idx_department (department),
    INDEX idx_is_scrapped (is_scrapped),
    INDEX idx_maintenance_team_id (maintenance_team_id)
);

-- Maintenance Requests Table
CREATE TABLE IF NOT EXISTS maintenance_requests (
    id VARCHAR(36) PRIMARY KEY,
    subject VARCHAR(200) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    type ENUM('CORRECTIVE', 'PREVENTIVE') NOT NULL,
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
    status ENUM('NEW', 'IN_PROGRESS', 'REPAIRED', 'SCRAP') DEFAULT 'NEW',
    equipment_id VARCHAR(36) NOT NULL,
    team_id VARCHAR(36),
    assigned_to VARCHAR(36),
    scheduled_date DATE,
    completed_date DATE,
    notes VARCHAR(1000),
    created_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE RESTRICT,
    FOREIGN KEY (team_id) REFERENCES maintenance_teams(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_equipment_id (equipment_id),
    INDEX idx_team_id (team_id),
    INDEX idx_status (status),
    INDEX idx_type (type),
    INDEX idx_scheduled_date (scheduled_date),
    INDEX idx_priority (priority)
);

-- System Logs Table
CREATE TABLE IF NOT EXISTS system_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(36),
    description TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
);

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_technician_id) REFERENCES technicians(id) ON DELETE SET NULL
);

-- System Logs Table
CREATE TABLE IF NOT EXISTS system_logs (
    id VARCHAR(36) PRIMARY KEY,
    action VARCHAR(50) NOT NULL,
    entity VARCHAR(50) NOT NULL,
    entity_id VARCHAR(36),
    details JSON,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX idx_equipment_team ON equipment(maintenance_team_id);
CREATE INDEX idx_requests_equipment ON maintenance_requests(equipment_id);
CREATE INDEX idx_requests_stage ON maintenance_requests(stage);
CREATE INDEX idx_requests_scheduled ON maintenance_requests(scheduled_date);

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Insert Maintenance Teams
INSERT INTO maintenance_teams (id, team_name, created_at, updated_at) VALUES
('team-001', 'Site A Team', NOW(), NOW()),
('team-002', 'Site B Team', NOW(), NOW()),
('team-003', 'Heavy Machinery Division', NOW(), NOW());

-- Insert Technicians
INSERT INTO technicians (id, name, team_id, created_at) VALUES
('tech-001', 'John Doe', 'team-001', NOW()),
('tech-002', 'Jane Smith', 'team-002', NOW()),
('tech-003', 'Mike Johnson', 'team-001', NOW()),
('tech-004', 'Sarah Davis', 'team-003', NOW()),
('tech-005', 'Robert Wilson', 'team-002', NOW());

-- Insert Equipment
INSERT INTO equipment (id, name, serial_number, category, purchase_date, warranty_expiry, department, assigned_employee, maintenance_team_id, location, is_scrapped, created_at, updated_at) VALUES
('eq-001', 'Excavator XL-2000', 'XL2000-20210515', 'Excavators', '2021-05-15', '2026-05-15', 'Heavy Machinery', 'John Doe', 'team-001', 'Site A - Warehouse 1', FALSE, NOW(), NOW()),
('eq-002', 'Bulldozer BD-500', 'BD500-20200301', 'Bulldozers', '2020-03-01', '2025-03-01', 'Heavy Machinery', 'Sarah Davis', 'team-003', 'Site B - Warehouse 2', FALSE, NOW(), NOW()),
('eq-003', 'Loader LD-300', 'LD300-20220820', 'Loaders', '2022-08-20', '2027-08-20', 'Light Equipment', 'Jane Smith', 'team-002', 'Site A - Warehouse 3', FALSE, NOW(), NOW()),
('eq-004', 'Crane CR-100', 'CR100-20190512', 'Cranes', '2019-05-12', '2024-05-12', 'Heavy Machinery', 'Mike Johnson', 'team-001', 'Site C - Warehouse 1', FALSE, NOW(), NOW()),
('eq-005', 'Compressor CP-50', 'CP50-20230101', 'Compressors', '2023-01-01', '2028-01-01', 'Light Equipment', 'Robert Wilson', 'team-002', 'Site A - Storage', FALSE, NOW(), NOW());

-- Insert Maintenance Requests
INSERT INTO maintenance_requests (id, subject, request_type, equipment_id, assigned_technician_id, scheduled_date, duration_hours, stage, created_at, updated_at, completed_at) VALUES
('req-001', 'Hydraulic Pump Repair', 'Corrective', 'eq-001', 'tech-001', '2025-12-28', 8.5, 'New', NOW(), NOW(), NULL),
('req-002', 'Engine Oil Change', 'Preventive', 'eq-002', 'tech-004', '2025-12-29', 4.0, 'In Progress', NOW(), NOW(), NULL),
('req-003', 'Belt Replacement', 'Corrective', 'eq-001', 'tech-003', '2025-12-27', 6.0, 'Repaired', DATE_SUB(NOW(), INTERVAL 2 DAY), NOW(), DATE_SUB(NOW(), INTERVAL 1 DAY)),
('req-004', 'Cabin Air Filter Change', 'Preventive', 'eq-003', 'tech-002', '2025-12-30', 3.0, 'New', NOW(), NOW(), NULL),
('req-005', 'General Inspection', 'Preventive', 'eq-004', 'tech-001', '2025-12-31', 2.0, 'New', NOW(), NOW(), NULL);

-- Insert System Logs
INSERT INTO system_logs (id, action, entity, entity_id, details, timestamp) VALUES
('log-001', 'CREATE', 'EQUIPMENT', 'eq-001', JSON_OBJECT('name', 'Excavator XL-2000', 'category', 'Excavators'), NOW()),
('log-002', 'CREATE', 'REQUEST', 'req-001', JSON_OBJECT('subject', 'Hydraulic Pump Repair', 'type', 'Corrective'), NOW()),
('log-003', 'UPDATE', 'REQUEST', 'req-002', JSON_OBJECT('stage', 'In Progress'), NOW()),
('log-004', 'CREATE', 'TEAM', 'team-001', JSON_OBJECT('name', 'Site A Team'), NOW());
