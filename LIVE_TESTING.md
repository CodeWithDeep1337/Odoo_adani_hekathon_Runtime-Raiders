# 🚀 GearGuard API - Running Live on Localhost

## ✅ Server is Running!

**API Base URL**: `http://localhost:5000`

---

## 🌐 How to Access

### Option 1: Interactive Test Client (Easiest)
```
http://localhost:5000
```
✅ Beautiful UI with all endpoints  
✅ Click to test any endpoint  
✅ Real-time responses  
✅ Create new equipment, teams, requests  

### Option 2: Direct API Calls
```
GET http://localhost:5000/api/equipment
GET http://localhost:5000/api/teams
GET http://localhost:5000/api/requests
```

### Option 3: Command Line (cURL)
```powershell
# Get all equipment
curl http://localhost:5000/api/equipment

# Get all teams
curl http://localhost:5000/api/teams

# Get all requests
curl http://localhost:5000/api/requests

# Get Kanban view
curl http://localhost:5000/api/requests/kanban

# Get reports
curl http://localhost:5000/api/requests/reports
```

---

## 📊 Key Endpoints (Quick Reference)

### Equipment
```
GET    /api/equipment              # List all
POST   /api/equipment              # Create
GET    /api/equipment/:id          # Get one
PUT    /api/equipment/:id          # Update
DELETE /api/equipment/:id          # Delete
GET    /api/equipment/:id/requests # Get equipment's requests
```

### Teams
```
GET    /api/teams                  # List all
POST   /api/teams                  # Create
GET    /api/teams/:id              # Get one
PUT    /api/teams/:id              # Update
DELETE /api/teams/:id              # Delete
POST   /api/teams/:id/technicians  # Add tech
GET    /api/teams/:id/requests     # Get team's requests
GET    /api/teams/:id/stats        # Team stats
```

### Requests
```
GET    /api/requests                     # List all
POST   /api/requests/corrective          # Create corrective
POST   /api/requests/preventive          # Create preventive
GET    /api/requests/:id                 # Get one
PUT    /api/requests/:id/assign-technician  # Assign tech
PUT    /api/requests/:id/mark-repaired   # Mark done
GET    /api/requests/kanban              # Kanban view
GET    /api/requests/calendar            # Calendar view
GET    /api/requests/reports             # Reports
```

---

## 🎯 Test Scenarios

### 1. View Pre-loaded Equipment
```
http://localhost:5000/api/equipment
```
You'll see 5 equipment items with full details.

### 2. View Teams & Technicians
```
http://localhost:5000/api/teams
```
3 teams with 7 total technicians.

### 3. View All Maintenance Requests
```
http://localhost:5000/api/requests
```
5 requests in different stages.

### 4. View Kanban (by Status)
```
http://localhost:5000/api/requests/kanban
```
Requests grouped: New, In Progress, Repaired, Scrap

### 5. View Calendar (Preventive by Date)
```
http://localhost:5000/api/requests/calendar
```
Scheduled maintenance grouped by date.

### 6. View Analytics Reports
```
http://localhost:5000/api/requests/reports
```
Summary stats, requests per team, per category, etc.

---

## 🔨 Create New Items

### Create Equipment (PowerShell)
```powershell
$body = @{
    equipmentName = "New Lathe"
    serialNumber = "LAT-2024-001"
    category = "Machinery"
    purchaseDate = "2024-01-01"
    warrantyExpiry = "2025-01-01"
    department = "Production"
    location = "Floor 1"
} | ConvertTo-Json

curl -X POST http://localhost:5000/api/equipment `
  -H "Content-Type: application/json" `
  -d $body
```

### Create Corrective Request
```powershell
$body = @{
    subject = "Machine is broken"
    equipmentId = "EQP-00001"
} | ConvertTo-Json

curl -X POST http://localhost:5000/api/requests/corrective `
  -H "Content-Type: application/json" `
  -d $body
```

### Create Preventive Request
```powershell
$body = @{
    subject = "Quarterly maintenance"
    equipmentId = "EQP-00001"
    scheduledDate = "2025-02-01"
} | ConvertTo-Json

curl -X POST http://localhost:5000/api/requests/preventive `
  -H "Content-Type: application/json" `
  -d $body
```

---

## 📱 Testing Tools

### Built-in Test Client (Recommended)
```
http://localhost:5000
```
✨ No installation needed  
✨ All endpoints available  
✨ Real-time response display  
✨ Interactive UI  

### Postman (If you have it)
```
Import the collection from:
- Equipment: /api/equipment
- Teams: /api/teams
- Requests: /api/requests
```

### VS Code REST Client Extension
Create a `.http` file:
```
GET http://localhost:5000/api/equipment

###

GET http://localhost:5000/api/teams

###

GET http://localhost:5000/api/requests/kanban
```

---

## 🔍 Sample IDs (From Seed Data)

**Equipment IDs:**
- `EQP-00001` - CNC Lathe Machine
- `EQP-00002` - Hydraulic Press
- `EQP-00003` - Industrial Drill Press
- `EQP-00004` - Air Compressor
- `EQP-00005` - Safety Harness Kit

**Team IDs:**
- `TEAM-0001` - Mechanical Maintenance Team
- `TEAM-0002` - Electrical Maintenance Team
- `TEAM-0003` - Hydraulics & Pneumatics Team

**Technician IDs:**
- `TECH-001` through `TECH-007`

**Request IDs:**
- `REQ-000001` through `REQ-000005`

---

## 📊 Pre-loaded Data

The API starts with:
- ✅ 5 Equipment items
- ✅ 3 Maintenance Teams
- ✅ 5 Maintenance Requests
- ✅ Sample system logs

This data automatically loads when the server starts.

---

## 💡 Common Tasks

### Get Equipment Details
```
GET /api/equipment/EQP-00001
```

### Get Equipment's Open Requests
```
GET /api/equipment/EQP-00001/open-count
```

### Get Team's Workload
```
GET /api/teams/TEAM-0001/stats
```

### Filter Equipment by Department
```
GET /api/equipment?department=Production
```

### Get Overdue Requests
Check `/api/requests/reports` - overdue count shown

### Assign Technician to Request
```
PUT /api/requests/REQ-000001/assign-technician
{
  "technicianId": "TECH-001"
}
```

### Mark Request as Repaired
```
PUT /api/requests/REQ-000001/mark-repaired
{
  "durationHours": 3
}
```

---

## 🐛 Troubleshooting

### "Connection refused"?
- ✅ Check server is running: Look for the banner message
- ✅ Port 5000 should be in use
- ✅ Try `http://localhost:5000/health`

### Getting 404?
- ✅ Make sure paths have `/api` prefix
- ✅ Check case sensitivity (endpoints are lowercase)
- ✅ Verify the API is running

### Server won't start?
```powershell
# Kill any existing processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
# Then start again
npm start
```

---

## 📈 What's Happening

The API:
- ✅ Stores all data in memory (resets when server restarts)
- ✅ Auto-calculates overdue status
- ✅ Validates all inputs
- ✅ Logs all requests
- ✅ Returns structured JSON responses
- ✅ Handles errors gracefully

---

## 🎓 Next Steps

1. **Explore the API** - Click endpoints in the test client
2. **Create custom data** - Add your own equipment/teams
3. **Test workflows** - Create requests and move them through stages
4. **View reports** - Check analytics and Kanban views
5. **Build a frontend** - Connect React/Vue/Next.js to this API

---

## 📚 Full Documentation

- `README.md` - Complete API docs
- `IMPLEMENTATION_SUMMARY.md` - What was built
- `QUICK_START.md` - Getting started guide
- Test Client UI - Interactive testing

---

**🚀 API is LIVE and ready to use!**

Happy testing! 🎉
