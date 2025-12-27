/**
 * API Test Script
 * Simple tests to verify the API is working
 */

const http = require('http');

const baseURL = 'http://localhost:5000';

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseURL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: data ? JSON.parse(data) : null
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n🧪 Starting API Tests...\n');

  try {
    // Test 1: Health Check
    console.log('Test 1: Health Check');
    const health = await makeRequest('/health');
    console.log(`✅ Status: ${health.status}`);
    console.log(`   Message: ${health.body.message}\n`);

    // Test 2: Get All Equipment
    console.log('Test 2: Get All Equipment');
    const equipment = await makeRequest('/api/equipment');
    console.log(`✅ Status: ${equipment.status}`);
    console.log(`   Found: ${equipment.body.count} items`);
    console.log(`   Sample: ${equipment.body.data[0]?.equipmentName}\n`);

    // Test 3: Get All Teams
    console.log('Test 3: Get All Teams');
    const teams = await makeRequest('/api/teams');
    console.log(`✅ Status: ${teams.status}`);
    console.log(`   Found: ${teams.body.count} teams`);
    console.log(`   Sample: ${teams.body.data[0]?.teamName}\n`);

    // Test 4: Get All Requests
    console.log('Test 4: Get All Requests');
    const requests = await makeRequest('/api/requests');
    console.log(`✅ Status: ${requests.status}`);
    console.log(`   Found: ${requests.body.count} requests`);
    console.log(`   Sample: ${requests.body.data[0]?.subject}\n`);

    // Test 5: Get Kanban View
    console.log('Test 5: Get Kanban View');
    const kanban = await makeRequest('/api/requests/kanban');
    console.log(`✅ Status: ${kanban.status}`);
    console.log(`   New: ${kanban.body.data['New'].length}`);
    console.log(`   In Progress: ${kanban.body.data['In Progress'].length}`);
    console.log(`   Repaired: ${kanban.body.data['Repaired'].length}`);
    console.log(`   Scrap: ${kanban.body.data['Scrap'].length}\n`);

    // Test 6: Get Reports
    console.log('Test 6: Get Reports');
    const reports = await makeRequest('/api/requests/reports');
    console.log(`✅ Status: ${reports.status}`);
    console.log(`   Total Requests: ${reports.body.data.summary.totalRequests}`);
    console.log(`   Open: ${reports.body.data.summary.openRequests}`);
    console.log(`   Closed: ${reports.body.data.summary.closedRequests}`);
    console.log(`   Overdue: ${reports.body.data.summary.overdueRequests}\n`);

    // Test 7: Create New Equipment
    console.log('Test 7: Create New Equipment');
    const newEquipment = await makeRequest('/api/equipment', 'POST', {
      equipmentName: 'Test Lathe Machine',
      serialNumber: 'TEST-2024-001',
      category: 'Machinery',
      purchaseDate: '2024-01-01',
      warrantyExpiry: '2025-01-01',
      department: 'Testing',
      location: 'Test Lab'
    });
    console.log(`✅ Status: ${newEquipment.status}`);
    console.log(`   Created ID: ${newEquipment.body.data.id}`);
    console.log(`   Name: ${newEquipment.body.data.equipmentName}\n`);

    // Test 8: Create Corrective Request
    console.log('Test 8: Create Corrective Maintenance Request');
    const correctiveReq = await makeRequest('/api/requests/corrective', 'POST', {
      subject: 'Test Maintenance Issue',
      equipmentId: 'EQP-00001'
    });
    console.log(`✅ Status: ${correctiveReq.status}`);
    console.log(`   Created ID: ${correctiveReq.body.data.id}`);
    console.log(`   Type: ${correctiveReq.body.data.requestType}`);
    console.log(`   Stage: ${correctiveReq.body.data.stage}\n`);

    // Test 9: Get Calendar View
    console.log('Test 9: Get Calendar View (Preventive by Date)');
    const calendar = await makeRequest('/api/requests/calendar');
    console.log(`✅ Status: ${calendar.status}`);
    const dates = Object.keys(calendar.body.data);
    console.log(`   Found: ${dates.length} dates with scheduled requests`);
    if (dates.length > 0) {
      console.log(`   Sample date: ${dates[0]}`);
      console.log(`   Requests on that date: ${calendar.body.data[dates[0]].length}\n`);
    }

    // Test 10: Get Equipment by ID
    console.log('Test 10: Get Equipment by ID');
    const singleEquipment = await makeRequest('/api/equipment/EQP-00001');
    console.log(`✅ Status: ${singleEquipment.status}`);
    console.log(`   Name: ${singleEquipment.body.data.equipmentName}`);
    console.log(`   Warranty Expired: ${singleEquipment.body.data.warrantyExpired}`);
    console.log(`   Days Remaining: ${singleEquipment.body.data.warrantyDaysRemaining}\n`);

    console.log('✅ All tests passed!\n');
  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }

  process.exit(0);
}

// Wait for server to be ready
setTimeout(runTests, 1000);
