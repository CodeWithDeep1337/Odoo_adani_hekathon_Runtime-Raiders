# GearGuard Backend - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Prerequisites
- Node.js 18+
- MySQL 5.7+
- npm

### Step 1: Install Dependencies
```bash
cd backend/backend
npm install
```

### Step 2: Configure Database
Update `.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=gearguard
```

Create database:
```sql
CREATE DATABASE IF NOT EXISTS gearguard;
```

### Step 3: Start Server
```bash
npm start
```

Server: `http://localhost:5000`

### Step 4: Test
```bash
curl http://localhost:5000/health
```

---

## 🔑 Auth Flow

### 1. Sign Up
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "User",
    "email": "user@test.com",
    "password": "Password123!",
    "role": "TECHNICIAN"
  }'
```

### 2. Verify OTP (Check email)
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@test.com",
    "otp": "123456"
  }'
```

### 3. Sign In
```bash
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@test.com",
    "password": "Password123!"
  }'
```

Save `accessToken`.

---

## 📋 Quick Operations

### Create Equipment
```bash
curl -X POST http://localhost:5000/api/equipment \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pump A",
    "serialNumber": "PUMP-001",
    "department": "Manufacturing",
    "purchaseDate": "2023-01-15",
    "warrantyEndDate": "2026-01-15",
    "location": "Building A"
  }'
```

### Create Maintenance Request
```bash
curl -X POST http://localhost:5000/api/requests \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Maintenance",
    "description": "Preventive maintenance",
    "type": "PREVENTIVE",
    "priority": "HIGH",
    "equipmentId": "<id>",
    "scheduledDate": "2025-12-20"
  }'
```

### Calendar (No Past Dates!)
```bash
curl -X GET "http://localhost:5000/api/requests/calendar/view?month=12&year=2025" \
  -H "Authorization: Bearer <token>"
```

### Update Status
```bash
curl -X PATCH http://localhost:5000/api/requests/<id>/status \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_PROGRESS"
  }'
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot find mysql2" | `npm install mysql2` |
| DB Connection fails | Check `.env` credentials, ensure MySQL running |
| Rate limited | Wait 15 min or set NODE_ENV=development |
| Token expired | Use `/api/auth/refresh-token` with refreshToken |

---

## 📚 Key Files

- `app.js` - Express setup
- `server.js` - Entry point
- `src/config/` - Configuration
- `src/services/` - Business logic
- `src/controllers/` - Request handlers
- `src/routes/` - API routes
- `src/middleware/` - Auth, validation, security

---

## 📖 Full Docs

See `PRODUCTION_BACKEND_DOCS.md`

**Ready to code! 🎉**
