# 🎯 QUICK: How to Run GearGuard API Live

## ⚡ 3 Quick Steps

### Step 1: Navigate to project folder
```powershell
cd "c:\Users\HARSHRAJSINH\OneDrive\Desktop\oddo adani"
```

### Step 2: Start the server
```powershell
npm start
```

You should see:
```
✅ Server is running at http://localhost:5000
```

### Step 3: Open in browser
```
http://localhost:5000
```

---

## 🎨 You'll See

A beautiful **interactive API test client** with:
- ✅ All 31 endpoints listed
- ✅ Click any endpoint to test it
- ✅ Real-time JSON responses
- ✅ Pre-loaded sample data
- ✅ Live statistics dashboard

---

## 🔗 Quick Links (After Server Starts)

| Link | Purpose |
|------|---------|
| `http://localhost:5000` | 📱 **Interactive Test Client** (START HERE) |
| `http://localhost:5000/api` | 📊 API Documentation |
| `http://localhost:5000/health` | ✅ Health Check |
| `http://localhost:5000/api/equipment` | 📦 All Equipment |
| `http://localhost:5000/api/teams` | 👥 All Teams |
| `http://localhost:5000/api/requests` | 📋 All Requests |
| `http://localhost:5000/api/requests/kanban` | 🎯 Kanban View |
| `http://localhost:5000/api/requests/calendar` | 📅 Calendar View |
| `http://localhost:5000/api/requests/reports` | 📊 Reports |

---

## 🎬 What Happens When You Start

```
✅ Server starts on port 5000
✅ Database loads with 5 equipment items
✅ 3 teams with 7 technicians load
✅ 5 maintenance requests load
✅ Static files (test client) ready to serve
✅ All 31 endpoints listening
✅ Ready for incoming requests
```

---

## 🧪 Test Immediately

**Option A: Use the Interactive UI (Easiest)**
1. Start server: `npm start`
2. Open: `http://localhost:5000`
3. Click any endpoint
4. See live JSON response

**Option B: Use Command Line**
```powershell
# Get all equipment
curl http://localhost:5000/api/equipment

# Get all requests
curl http://localhost:5000/api/requests

# Get reports
curl http://localhost:5000/api/requests/reports
```

**Option C: Postman/Insomnia**
Use the URLs above with POST/GET/PUT/DELETE methods

---

## ✨ Pre-loaded Data (Automatically)

When you start the server, it loads:

**5 Equipment Items:**
- CNC Lathe Machine
- Hydraulic Press
- Industrial Drill Press
- Air Compressor
- Safety Harness Kit

**3 Teams (7 Technicians):**
- Mechanical Team
- Electrical Team
- Hydraulics Team

**5 Requests:**
- Mix of corrective & preventive
- Different stages
- Some overdue

---

## 🛑 To Stop the Server

Press `Ctrl + C` in the terminal

---

## 🔄 Restart (If Needed)

```powershell
# Stop: Ctrl + C
# Then:
npm start
```

---

## 📍 Server Status Indicators

When running, you'll see:
```
╔════════════════════════════════════════╗
║   GearGuard - Ultimate Maintenance     ║
║        Backend API v1.0.0              ║
╚════════════════════════════════════════╝

✅ Server is running at http://localhost:5000
📊 API Documentation:
   - Health Check: http://localhost:5000/health
   - Equipment: http://localhost:5000/api/equipment
   - Teams: http://localhost:5000/api/teams
   - Requests: http://localhost:5000/api/requests

Press Ctrl+C to stop the server.
```

---

## 💾 Data Persistence

⚠️ **Important**: Data is stored in memory  
- Restarts: Data resets to seed data
- Changes persist: Until server restarts
- Perfect for: Testing and development

For permanent storage, migrate to SQL (see README.md)

---

## 🎓 Files You Need to Know

| File | Purpose |
|------|---------|
| `server.js` | Starts the server |
| `app.js` | Express app config |
| `index.html` | Test client UI |
| `src/` | All API code |

---

## 🚀 You're All Set!

```
npm start → http://localhost:5000 → Start Testing! 🎉
```

That's it! Everything else is already built and ready to use.

---

**Created**: December 27, 2024  
**API Version**: 1.0.0  
**Status**: Production Ready ✅
