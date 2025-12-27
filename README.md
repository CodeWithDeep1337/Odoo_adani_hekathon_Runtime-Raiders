# GearGuard - The Ultimate Maintenance Tracker API

A production-quality backend API for equipment maintenance tracking and management. Built with Node.js + Express with clean layered architecture designed for easy migration to SQL databases.

## Features

✅ **Equipment Management** - Create, read, update, delete equipment with warranty tracking
✅ **Maintenance Teams** - Organize technicians into teams with role management
✅ **Maintenance Requests** - Support for both Corrective and Preventive maintenance
✅ **Auto-Overdue Calculation** - Automatically calculates overdue status for preventive requests
✅ **Scrap Logic** - Equipment scrapping with automatic system logging
✅ **Calendar View** - Preventive requests grouped by scheduled date
✅ **Kanban View** - Requests grouped by status (New, In Progress, Repaired, Scrap)
✅ **Advanced Reports** - Analytics on requests per team, category, type, and status
✅ **System Audit Logs** - Complete history of all actions
✅ **Clean Architecture** - Controllers, Services, Repositories for easy DB migration

## Tech Stack

- **Runtime**: Node.js (LTS)
- **Framework**: Express.js
- **Storage**: In-Memory (Arrays/Objects) - Ready for SQL migration
- **Language**: JavaScript (ES6+)
- **No external DB or ORM** - Structure prepared for future SQL integration

## Installation

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm or yarn

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start

# Server will run on http://localhost:5000
```

The server initializes with seed data automatically on startup.

## Project Structure

```
/
├── app.js                          # Express app configuration
├── server.js                       # Server startup and initialization
├── package.json                    # Dependencies
│
└── src/
    ├── config/
    │   ├── constants.js           # Global constants
    │   └── database.js            # In-memory database setup
    │
    ├── models/
    │   ├── Equipment.js           # Equipment entity
    │   ├── MaintenanceTeam.js     # Team entity
    │   └── MaintenanceRequest.js  # Request entity
    │
    ├── repositories/              # Data access layer (SQL-ready)
    │   ├── EquipmentRepository.js
    │   ├── MaintenanceTeamRepository.js
    │   ├── MaintenanceRequestRepository.js
    │   └── SystemLogsRepository.js
    │
    ├── services/                  # Business logic layer
    │   ├── EquipmentService.js
    │   ├── MaintenanceTeamService.js
    │   └── MaintenanceRequestService.js
    │
    ├── controllers/               # HTTP request handlers
    │   ├── EquipmentController.js
    │   ├── MaintenanceTeamController.js
    │   └── MaintenanceRequestController.js
    │
    ├── routes/                    # API route definitions
    │   ├── equipmentRoutes.js
    │   ├── teamRoutes.js
    │   └── requestRoutes.js
    │
    ├── middleware/                # Express middleware
    │   ├── errorHandler.js        # Global error handling
    │   ├── validators.js          # Request validation
    │   └── logger.js              # Request logging
    │
    ├── utils/                     # Utility functions
    │   ├── idGenerator.js         # ID generation
    │   ├── dateHelper.js          # Date utilities
    │   └── validators.js          # Data validation
    │
    └── data/
        └── seedData.js            # Test seed data
```

## API Endpoints

### Health Check
```
GET /health
```

### Equipment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/equipment` | Create new equipment |
| GET | `/api/equipment` | Get all equipment (with filters) |
| GET | `/api/equipment/:id` | Get equipment by ID |
| PUT | `/api/equipment/:id` | Update equipment |
| DELETE | `/api/equipment/:id` | Delete equipment |
| GET | `/api/equipment/:id/requests` | Get equipment's maintenance requests |
| GET | `/api/equipment/:id/open-count` | Get count of open requests |
| PUT | `/api/equipment/:id/assign-employee` | Assign to employee |
| PUT | `/api/equipment/:id/assign-team` | Assign to maintenance team |

**Query Parameters (GET /api/equipment)**
- `department` - Filter by department
- `employee` - Filter by assigned employee
- `teamId` - Filter by maintenance team
- `category` - Filter by equipment category
- `scrapped` - Filter by scrapped status (true/false)

### Maintenance Team Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/teams` | Create new team |
| GET | `/api/teams` | Get all teams |
| GET | `/api/teams/:id` | Get team by ID |
| PUT | `/api/teams/:id` | Update team |
| DELETE | `/api/teams/:id` | Delete team |
| POST | `/api/teams/:id/technicians` | Add technician to team |
| DELETE | `/api/teams/:id/technicians/:technicianId` | Remove technician |
| GET | `/api/teams/:id/requests` | Get team's requests |
| GET | `/api/teams/:id/stats` | Get team statistics |

### Maintenance Request Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/requests/corrective` | Create corrective request |
| POST | `/api/requests/preventive` | Create preventive request |
| GET | `/api/requests` | Get all requests |
| GET | `/api/requests/:id` | Get request by ID |
| PUT | `/api/requests/:id/assign-technician` | Assign technician |
| PUT | `/api/requests/:id/move-in-progress` | Move to In Progress |
| PUT | `/api/requests/:id/mark-repaired` | Mark as Repaired |
| PUT | `/api/requests/:id/mark-scrap` | Mark for Scrap |
| GET | `/api/requests/calendar` | Get calendar view (preventive by date) |
| GET | `/api/requests/kanban` | Get Kanban view (grouped by status) |
| GET | `/api/requests/reports` | Get analytics reports |

## Request/Response Examples

### Create Equipment

**Request:**
```json
POST /api/equipment
{
  "equipmentName": "Hydraulic Press",
  "serialNumber": "HYD-2024-001",
  "category": "Hydraulic",
  "purchaseDate": "2024-01-15",
  "warrantyExpiry": "2026-01-15",
  "department": "Manufacturing",
  "assignedEmployee": "EMP-001",
  "maintenanceTeamId": "TEAM-0001",
  "location": "Floor 2, Station A"
}
```

**Response:**
```json
{
  "status": 201,
  "message": "Equipment created successfully",
  "data": {
    "id": "EQP-00006",
    "equipmentName": "Hydraulic Press",
    "serialNumber": "HYD-2024-001",
    "category": "Hydraulic",
    "purchaseDate": "2024-01-15",
    "warrantyExpiry": "2026-01-15",
    "warrantyExpired": false,
    "warrantyDaysRemaining": 717,
    "department": "Manufacturing",
    "assignedEmployee": "EMP-001",
    "maintenanceTeamId": "TEAM-0001",
    "location": "Floor 2, Station A",
    "isScrapped": false,
    "createdAt": "2024-12-27",
    "updatedAt": "2024-12-27"
  }
}
```

### Create Corrective Maintenance Request

**Request:**
```json
POST /api/requests/corrective
{
  "subject": "Spindle Bearing Replacement",
  "equipmentId": "EQP-00001"
}
```

**Response:**
```json
{
  "status": 201,
  "message": "Corrective maintenance request created successfully",
  "data": {
    "id": "REQ-000006",
    "subject": "Spindle Bearing Replacement",
    "requestType": "Corrective",
    "equipmentId": "EQP-00001",
    "category": "Machinery",
    "maintenanceTeamId": "TEAM-0001",
    "assignedTechnicianId": null,
    "stage": "New",
    "overdue": false,
    "createdAt": "2024-12-27",
    "updatedAt": "2024-12-27",
    "completedAt": null
  }
}
```

### Create Preventive Maintenance Request

**Request:**
```json
POST /api/requests/preventive
{
  "subject": "Quarterly Maintenance Check",
  "equipmentId": "EQP-00002",
  "scheduledDate": "2025-01-15"
}
```

### Assign Technician to Request

**Request:**
```json
PUT /api/requests/REQ-000001/assign-technician
{
  "technicianId": "TECH-001"
}
```

### Get Kanban View

**Request:**
```
GET /api/requests/kanban
```

**Response:**
```json
{
  "status": 200,
  "message": "Kanban view retrieved successfully",
  "data": {
    "New": [...],
    "In Progress": [...],
    "Repaired": [...],
    "Scrap": [...]
  }
}
```

### Get Reports

**Request:**
```
GET /api/requests/reports
```

**Response:**
```json
{
  "status": 200,
  "message": "Reports retrieved successfully",
  "data": {
    "summary": {
      "totalRequests": 10,
      "openRequests": 6,
      "closedRequests": 4,
      "overdueRequests": 1,
      "preventiveRequests": 5,
      "correctiveRequests": 5
    },
    "requestsPerTeam": {
      "Mechanical Maintenance Team": 5,
      "Electrical Maintenance Team": 5
    },
    "requestsPerCategory": {
      "Machinery": 6,
      "Hydraulic": 3,
      "Pneumatic": 1
    },
    "requestsPerType": {
      "preventive": 5,
      "corrective": 5
    },
    "requestsPerStatus": {
      "open": 6,
      "closed": 4
    }
  }
}
```

## Data Models

### Equipment
- `id` - Unique equipment ID
- `equipmentName` - Name of equipment
- `serialNumber` - Serial number
- `category` - Type (Machinery, Electrical, Pneumatic, Hydraulic, Tools, Safety Equipment, Other)
- `purchaseDate` - Purchase date (YYYY-MM-DD)
- `warrantyExpiry` - Warranty expiry date (YYYY-MM-DD)
- `department` - Department name
- `assignedEmployee` - Employee ID (optional)
- `maintenanceTeamId` - Team ID (optional)
- `location` - Equipment location
- `isScrapped` - Boolean flag
- `createdAt` / `updatedAt` - Timestamps

### Maintenance Team
- `id` - Unique team ID
- `teamName` - Team name
- `technicians` - Array of technician IDs
- `createdAt` / `updatedAt` - Timestamps

### Maintenance Request
- `id` - Unique request ID
- `subject` - Issue description
- `requestType` - "Corrective" or "Preventive"
- `equipmentId` - Associated equipment ID
- `category` - Auto-filled from equipment
- `maintenanceTeamId` - Auto-filled from equipment
- `assignedTechnicianId` - Assigned technician ID (optional)
- `scheduledDate` - Scheduled date for preventive (YYYY-MM-DD)
- `durationHours` - Hours spent on repair
- `stage` - "New", "In Progress", "Repaired", or "Scrap"
- `overdue` - Auto-calculated boolean
- `completedAt` - Completion date (optional)
- `createdAt` / `updatedAt` - Timestamps

## Business Logic

### Corrective Maintenance Flow
1. User selects equipment
2. System auto-fills category and maintenance team from equipment
3. Request stage starts at "New"
4. Technician must belong to assigned team
5. Technician moves request to "In Progress"
6. On finish: Duration hours required → stage becomes "Repaired"

### Preventive Maintenance Flow
1. Scheduled date is required
2. Shows in calendar API
3. Auto-overdue = true if scheduledDate < today and not "Repaired"

### Scrap Logic
- When stage becomes "Scrap":
  - Equipment.isScrapped = true
  - Event logged to systemLogs
  - All updates recorded for audit trail

## Validation Rules

- Equipment name: Required, non-empty
- Serial number: Required, non-empty
- Category: Must be valid equipment category
- Dates: Format YYYY-MM-DD, valid dates only
- Department: Required, non-empty
- Location: Required, non-empty
- Preventive requests: scheduledDate required
- Technician assignment: Technician must belong to assigned team
- Repair marking: Duration hours must be > 0

## Error Handling

All errors return structured JSON:

```json
{
  "status": 400,
  "message": "Error description",
  "errors": ["Error detail 1", "Error detail 2"]
}
```

Common status codes:
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `500` - Internal Server Error

## Architecture & Design Patterns

### Layered Architecture
- **Controllers** - HTTP handling only, no business logic
- **Services** - All business logic, validation, calculations
- **Repositories** - Data access, currently in-memory
- **Models** - Entity definitions with helper methods
- **Middleware** - Cross-cutting concerns (auth, validation, logging)

### Future SQL Migration

To migrate to SQL, replace in-memory repositories:

1. Replace `EquipmentRepository.js` with SQL queries
2. Replace `MaintenanceTeamRepository.js` with SQL queries
3. Replace `MaintenanceRequestRepository.js` with SQL queries
4. Replace `SystemLogsRepository.js` with SQL queries
5. Update `database.js` to use actual SQL connection
6. No changes needed to services, controllers, or routes!

## Testing with cURL

```bash
# Health check
curl http://localhost:5000/health

# Create equipment
curl -X POST http://localhost:5000/api/equipment \
  -H "Content-Type: application/json" \
  -d '{"equipmentName":"Press","serialNumber":"P001","category":"Machinery","purchaseDate":"2024-01-01","warrantyExpiry":"2025-01-01","department":"Prod","location":"A1"}'

# Get all equipment
curl http://localhost:5000/api/equipment

# Get Kanban view
curl http://localhost:5000/api/requests/kanban

# Get reports
curl http://localhost:5000/api/requests/reports
```

## License

MIT License - Free to use and modify

## Author

GearGuard Development Team
