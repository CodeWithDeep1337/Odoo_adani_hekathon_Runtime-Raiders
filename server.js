/**
 * Server Startup
 * Initialize database and start Express server
 */

const app = require('./app');
const { initializeDatabase, getStatus } = require('./src/config/database');
const config = require('./src/config/env');

const PORT = config.PORT;
const HOST = config.HOST;

/**
 * Start server
 */
const startServer = async () => {
  try {
    // Initialize database
    console.log('[Server] Initializing database...');
    const dbReady = await initializeDatabase();

    if (!dbReady) {
      console.warn('[Server] Database connection failed. Server may run in limited mode.');
    }

    const dbStatus = getStatus();
    console.log('[Database] Status:', dbStatus);

    // Start Express server
    const server = app.listen(PORT, HOST, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════════╗
║          GearGuard - The Ultimate Maintenance Tracker         ║
║                   Production Backend API v1.0.0               ║
╚═══════════════════════════════════════════════════════════════╝

✅ Server is running at http://${HOST}:${PORT}

📊 API Endpoints:
   - Health Check:          GET  http://${HOST}:${PORT}/health
   - Authentication:        POST http://${HOST}:${PORT}/api/auth/signup
   - Equipment:             GET  http://${HOST}:${PORT}/api/equipment
   - Maintenance Teams:     GET  http://${HOST}:${PORT}/api/teams
   - Maintenance Requests:  GET  http://${HOST}:${PORT}/api/requests
   - Calendar (Preventive): GET  http://${HOST}:${PORT}/api/requests/calendar/view?month=&year=

🔒 Security:
   - JWT Authentication enabled
   - Rate limiting active
   - Helmet security headers enabled
   - CORS configured

🗓️  Key Features:
   ✓ Calendar logic with NO past dates allowed
   ✓ Smart automation with auto-fill equipment
   ✓ Kanban board with enforced status transitions
   ✓ Equipment scrap logic
   ✓ OTP email verification
   ✓ Role-based access control

🔧 Environment: ${config.NODE_ENV}
📋 Database: ${dbStatus.database}

Press Ctrl+C to stop the server.
    `);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('\n[Server] SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('[Server] HTTP server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('\n[Server] SIGINT signal received: closing HTTP server');
      server.close(() => {
        console.log('[Server] HTTP server closed');
        process.exit(0);
      });
    });

    // Unhandled rejection
    process.on('unhandledRejection', (reason, promise) => {
      console.error('[Error] Unhandled Rejection at:', promise, 'reason:', reason);
    });
  } catch (error) {
    console.error('[Server] Fatal error during startup:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
