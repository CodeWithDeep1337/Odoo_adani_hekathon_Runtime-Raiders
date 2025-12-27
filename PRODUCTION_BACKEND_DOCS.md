# GearGuard - Production Backend Documentation

## ✅ Backend Implementation Complete

This is a **production-ready** backend for the GearGuard Maintenance Management System, built with Node.js, Express.js, and MySQL.

---

## 🏗️ Architecture Overview

```
Backend Structure (MVC + Service Layer):
├── src/
│   ├── config/          # Configuration files
│   │   ├── env.js      # Environment variables
│   │   ├── database.js # MySQL connection & schema
│   │   └── mailer.js   # Nodemailer SMTP setup
│   ├── models/         # Data models
│   │   └── User.js
│   ├── controllers/    # Request handlers (thin layer)
│   │   ├── AuthController.js
│   │   ├── EquipmentController.js
│   │   ├── MaintenanceRequestController.js
│   │   └── MaintenanceTeamController.js
│   ├── services/       # Business logic (powerful layer)
│   │   ├── AuthService.js
│   │   ├── EquipmentService.js
│   │   ├── MaintenanceRequestService.js
│   │   └── MaintenanceTeamService.js
│   ├── routes/         # API routes
│   │   ├── authRoutes.js
│   │   ├── equipmentRoutes.js
│   │   ├── requestRoutes.js
│   │   └── teamRoutes.js
│   ├── middleware/     # Express middleware
│   │   ├── authMiddleware.js         # JWT verification & roles
│   │   ├── errorHandler.js           # Global error handling
│   │   ├── securityMiddleware.js    # Helmet, CORS, Rate limiting
│   │   └── validationMiddleware.js  # Joi schema validation
│   ├── validations/    # Joi validation schemas
│   │   └── schemas.js
│   ├── utils/          # Utility functions
│   │   ├── cryptoHelper.js   # bcrypt, OTP, passwords
│   │   ├── jwtHelper.js      # JWT tokens
│   │   └── dateHelper.js     # Date validation
│   └── data/           # Database
│       └── schema.sql   # MySQL schema
├── app.js              # Express app setup
├── server.js           # Server entry point
├── package.json        # Dependencies
└── .env                # Environment variables

```

---

## 🚀 Key Features Implemented

### ✅ Authentication & User Management
- **Sign Up**: Name, Email, Password, Role (ADMIN, MANAGER, TECHNICIAN, USER)
- **OTP Email Verification**: 6-digit OTP sent via Nodemailer
- **Sign In**: Email + Password with JWT tokens
- **Forgot Password**: OTP-based password reset
- **Refresh Tokens**: Long-lived tokens for session continuity
- **Logout**: Token revocation
- **Role-Based Access Control**: Admin, Manager, Technician, User roles

### ✅ Equipment Management
- **CRUD Operations**: Create, Read, Update, Delete
- **Smart Serial Number Validation**: Unique constraint
- **Warranty Tracking**: Days remaining calculation
- **Scrap Logic**: Auto-mark equipment as scrapped when maintenance status = SCRAP
- **Equipment Fields**:
  - name, serialNumber, department, purchaseDate, warrantyEndDate
  - assignedEmployee, maintenanceTeam, location, isScrapped

### ✅ Maintenance Team Management
- **Team CRUD**: Create, update, delete teams
- **Team Members**: Add/remove technicians from teams
- **Team Details**: Lead, name, description, members list

### ✅ Maintenance Requests (Core Module)
- **Request Types**: CORRECTIVE, PREVENTIVE
- **Status Workflow** (Kanban): NEW → IN_PROGRESS → REPAIRED, or → SCRAP
- **Priority Levels**: LOW, MEDIUM, HIGH, CRITICAL
- **Smart Auto-Fill**: Automatically assigns maintenance team from equipment
- **Status Transitions** (Enforced):
  - NEW → IN_PROGRESS or SCRAP
  - IN_PROGRESS → REPAIRED or SCRAP
  - Reject invalid transitions

### ✅ **CRITICAL CALENDAR LOGIC** (NO PAST DATES)
- **Preventive Maintenance Calendar**: GET /api/requests/calendar/view?month=&year=
- **Strict Validation**: Server-side rejection of any past scheduled dates
- **Returns**: Only PREVENTIVE maintenance requests sorted by date
- **Safe for Frontend**: Even if client sends past date, server validates and rejects

### ✅ Security Features
- **Helmet**: Security headers (CSP, HSTS, X-Frame-Options, etc.)
- **Rate Limiting**: 
  - General API: 100 requests/15 min
  - Auth endpoints: 5 requests/15 min
- **CORS**: Configured for frontend origin
- **bcryptjs**: Passwords hashed with 10 rounds
- **JWT**: Access tokens (15m) + Refresh tokens (7d)
- **OTP**: 6-digit, 5-minute expiry, max 5 attempts
- **No Sensitive Data**: Never expose passwords, OTP hashes, or internal secrets

### ✅ Global Error Handling
- **Centralized Error Middleware**: Catches all errors
- **Standard Response Format**:
  ```json
  {
    "success": true/false,
    "message": "Readable message",
    "data": {}
  }
  ```
- **HTTP Status Codes**: Proper status codes (201, 400, 401, 403, 404, 409, 429, 500)
- **No Server Crashes**: All errors caught and handled gracefully

---

## 📚 API Endpoints

### Authentication Endpoints
```
POST   /api/auth/signup               - Register new user
POST   /api/auth/signin               - Login with email/password
POST   /api/auth/verify-otp           - Verify email with OTP
POST   /api/auth/forgot-password      - Send password reset OTP
POST   /api/auth/reset-password       - Reset password with OTP
POST   /api/auth/refresh-token        - Get new access token
GET    /api/auth/profile              - Get current user profile
POST   /api/auth/logout               - Logout user
```

### Equipment Endpoints
```
GET    /api/equipment                 - Get all equipment
GET    /api/equipment/:id             - Get equipment by ID
GET    /api/equipment/:id/warranty    - Get warranty status
POST   /api/equipment                 - Create equipment (ADMIN/MANAGER)
PUT    /api/equipment/:id             - Update equipment (ADMIN/MANAGER)
DELETE /api/equipment/:id             - Delete equipment (ADMIN/MANAGER)
```

### Maintenance Team Endpoints
```
GET    /api/teams                     - Get all teams
GET    /api/teams/:id                 - Get team by ID
GET    /api/teams/:id/members         - Get team members
POST   /api/teams                     - Create team (ADMIN/MANAGER)
PUT    /api/teams/:id                 - Update team (ADMIN/MANAGER)
DELETE /api/teams/:id                 - Delete team (ADMIN/MANAGER)
POST   /api/teams/:id/members         - Add team member (ADMIN/MANAGER)
DELETE /api/teams/:id/members/:userId - Remove team member (ADMIN/MANAGER)
```

### Maintenance Request Endpoints
```
GET    /api/requests                  - Get all requests with filters
GET    /api/requests/:id              - Get request by ID
GET    /api/requests/calendar/view    - **CALENDAR (NO PAST DATES!)**
POST   /api/requests                  - Create request (TECH/MANAGER/ADMIN)
PUT    /api/requests/:id              - Update request (TECH/MANAGER/ADMIN)
PATCH  /api/requests/:id/status       - **Update status (KANBAN)**
DELETE /api/requests/:id              - Delete request (only NEW status)
```

---

## 🔐 Authentication Flow

### Sign Up Flow
```
1. User submits: name, email, password, role
2. Check: Email not already registered
3. Hash password with bcryptjs (10 rounds)
4. Create user in DB with status = PENDING_VERIFICATION
5. Generate 6-digit OTP
6. Hash OTP with bcryptjs
7. Store OTP in DB with 5-minute expiry
8. Send OTP email via Nodemailer
9. Response: userId, email, message
```

### OTP Verification Flow
```
1. User submits: email, otp
2. Fetch OTP record from DB
3. Check: OTP not expired
4. Check: Attempts < 5 attempts
5. Verify OTP against hash using bcryptjs
6. On success:
   - Mark user status = VERIFIED
   - Delete OTP from DB
   - Response: user data
```

### Sign In Flow
```
1. User submits: email, password
2. Fetch user from DB by email
3. Check: User status = VERIFIED
4. Compare password against hash
5. Generate Access Token (15m) and Refresh Token (7d)
6. Store Refresh Token in DB with expiry
7. Response: user, accessToken, refreshToken, expiresIn
```

---

## 🗓️ Calendar Logic (CRITICAL)

### Key Rules
1. **NO PAST DATES ALLOWED**: Server validates `scheduledDate >= currentDate`
2. **Only PREVENTIVE Maintenance**: Returns only PREVENTIVE requests
3. **Sort by Date**: Chronological order
4. **Server-Side Validation**: Client can't bypass

### Usage
```
GET /api/requests/calendar/view?month=12&year=2025

Response:
{
  "success": true,
  "message": "Calendar retrieved successfully",
  "data": {
    "month": 12,
    "year": 2025,
    "count": 5,
    "requests": [
      {
        "id": "...",
        "subject": "Preventive Maintenance",
        "type": "PREVENTIVE",
        "scheduled_date": "2025-12-15",
        "equipment_name": "...",
        "team_name": "...",
        ...
      },
      ...
    ]
  }
}
```

### Past Date Rejection Example
```
POST /api/requests
Body: {
  "scheduledDate": "2024-01-01",  // Past date
  ...
}

Response (400):
{
  "success": false,
  "message": "Scheduled date cannot be in the past. Please select today or a future date.",
  "data": {}
}
```

---

## 🎯 Kanban Status Workflow

### Valid Transitions (Enforced)
```
NEW
├── → IN_PROGRESS
└── → SCRAP

IN_PROGRESS
├── → REPAIRED
└── → SCRAP

REPAIRED (terminal)
└── (no transitions)

SCRAP (terminal)
├── When SCRAP status set:
│   └── Equipment marked as scrapped (is_scrapped = true)
│   └── Future maintenance prevented
└── (no transitions)
```

### Example: Invalid Transition
```
PATCH /api/requests/req-123/status
Body: { "status": "SCRAP" }

Current status: REPAIRED (terminal state)

Response (400):
{
  "success": false,
  "message": "Invalid status transition from REPAIRED to SCRAP. Valid transitions: None",
  "data": {}
}
```

### Scrap Logic
When a maintenance request is marked as SCRAP:
1. Status updates to SCRAP
2. Equipment is automatically marked `is_scrapped = true`
3. No new maintenance requests can be created for that equipment
4. Prevents accidental maintenance on scrapped equipment

---

## 🔒 Role-Based Access Control

### Roles & Permissions
```
ADMIN
├── All endpoints
├── Create/Update/Delete equipment
├── Create/Update/Delete teams
├── Create/Update maintenance requests
└── View all data

MANAGER
├── Create/Update/Delete equipment
├── Create/Update/Delete teams
├── Create/Update maintenance requests
└── View all data

TECHNICIAN
├── View equipment
├── View teams
├── Create/Update maintenance requests
├── Update request status (Kanban workflow)
└── Cannot create/update/delete teams

USER
├── View-only access to equipment
├── View maintenance requests
└── View teams
```

### Usage
```
// Protect routes with role middleware
router.post('/', roleMiddleware('ADMIN', 'MANAGER'), controller.create);

// In middleware
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
```

---

## 📊 Smart Automation

### Auto-Fill Logic
When creating a maintenance request:
```javascript
// If equipmentId provided, auto-fetch equipment details
const equipment = await EquipmentService.getEquipmentById(equipmentId);

// Auto-assign maintenance team from equipment
let teamId = data.teamId || equipment.maintenance_team_id || null;

// Store request with auto-filled team
```

### Scrap Logic
```javascript
// When status updated to SCRAP
if (newStatus === 'SCRAP') {
  await EquipmentService.scrapEquipment(request.equipment_id);
  // Sets is_scrapped = true
  // Blocks future maintenance requests
}
```

---

## 🔧 Setup & Installation

### 1. Install Dependencies
```bash
cd backend/backend
npm install
```

### 2. Configure Environment
Create/update `.env` file:
```env
# App
NODE_ENV=development
PORT=5000
HOST=localhost

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=gearguard
DB_PORT=3306

# JWT
JWT_ACCESS_SECRET=your_access_secret_key_change_in_production
JWT_REFRESH_SECRET=your_refresh_secret_key_change_in_production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# OTP
OTP_EXPIRY=300000
OTP_MAX_ATTEMPTS=5
OTP_LENGTH=6

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=noreply@gearguard.com

# Rate Limiting
API_RATE_LIMIT_WINDOW=15
API_RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_WINDOW=15
AUTH_RATE_LIMIT_MAX_REQUESTS=5

# Security
BCRYPT_ROUNDS=10

# Frontend
FRONTEND_URL=http://localhost:5173
```

### 3. Create MySQL Database
```sql
CREATE DATABASE IF NOT EXISTS gearguard;
```

### 4. Start Server
```bash
npm start
# or for development with auto-reload
npm run dev
```

### 5. Verify Server
```bash
curl http://localhost:5000/health
```

---

## 🧪 Example Requests

### 1. Sign Up
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePassword123!",
    "role": "TECHNICIAN"
  }'
```

### 2. Create Equipment
```bash
curl -X POST http://localhost:5000/api/equipment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "name": "Industrial Pump",
    "serialNumber": "PUMP-2025-001",
    "department": "Manufacturing",
    "assignedEmployee": "John Doe",
    "purchaseDate": "2023-06-15",
    "warrantyEndDate": "2026-06-15",
    "location": "Building A, Floor 2"
  }'
```

### 3. Create Maintenance Request (With Calendar Validation)
```bash
curl -X POST http://localhost:5000/api/requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "subject": "Monthly Preventive Maintenance",
    "description": "Regular preventive maintenance check for pump",
    "type": "PREVENTIVE",
    "priority": "HIGH",
    "equipmentId": "eqp-123",
    "teamId": "team-456",
    "scheduledDate": "2025-12-20"
  }'
```

Note: `scheduledDate` must be today or in the future. Past dates are rejected.

### 4. Get Calendar (Preventive Maintenance Only)
```bash
curl -X GET "http://localhost:5000/api/requests/calendar/view?month=12&year=2025" \
  -H "Authorization: Bearer <access_token>"
```

### 5. Update Request Status (Kanban)
```bash
curl -X PATCH http://localhost:5000/api/requests/req-123/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "status": "IN_PROGRESS"
  }'
```

---

## 📝 Response Format

All API responses follow this standard format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // endpoint-specific data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "data": {
    "errors": [
      {
        "field": "email",
        "message": "Must be a valid email"
      }
    ]
  }
}
```

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (duplicate entry)
- `429`: Too Many Requests (rate limited)
- `500`: Internal Server Error

---

## 🛡️ Security Best Practices

1. **Passwords**: Never stored in plain text, always hashed with bcryptjs
2. **OTP**: Hashed, time-limited (5 min), attempt-limited (5 max)
3. **Tokens**: JWT with short expiry (15m), refresh tokens long-lived (7d)
4. **Secrets**: All in `.env`, never committed to git
5. **Rate Limiting**: Prevents brute force attacks
6. **CORS**: Restricted to frontend origin
7. **Helmet**: Security headers on all responses
8. **Validation**: All inputs validated with Joi schemas
9. **No Sensitive Data**: Never return passwords, hashes, or OTP in responses

---

## 🚀 Production Deployment

1. Set `NODE_ENV=production`
2. Update JWT secrets to strong random values
3. Configure MySQL with proper backups
4. Enable HTTPS
5. Set up environment-specific `.env`
6. Configure SMTP for email delivery
7. Monitor rate limiting and adjust as needed
8. Set up logging and error tracking
9. Configure database backups
10. Test all critical flows before go-live

---

## 📞 Support

This backend is production-ready and follows industry best practices:
- ✅ Clean MVC + Service Layer architecture
- ✅ Security-first approach
- ✅ Comprehensive error handling
- ✅ Scalable database schema
- ✅ Reusable utility functions
- ✅ No code duplication
- ✅ Standard response format
- ✅ Full authentication system
- ✅ Calendar with NO past dates
- ✅ Kanban workflow enforcement
- ✅ Smart automation features

**Ready for production use!**
