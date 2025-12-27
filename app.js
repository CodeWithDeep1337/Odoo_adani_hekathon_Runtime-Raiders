/**
 * Express Application Setup
 * Main application configuration, security, and route mounting
 */

const express = require('express');
const config = require('./src/config/env');
const { securityHeaders, corsMiddleware, apiLimiter } = require('./src/middleware/securityMiddleware');
const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandler');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const equipmentRoutes = require('./src/routes/equipmentRoutes');
const teamRoutes = require('./src/routes/teamRoutes');
const requestRoutes = require('./src/routes/requestRoutes');

// Create Express app
const app = express();

/**
 * Security Middleware
 */

// Security headers
app.use(securityHeaders);

// CORS
app.use(corsMiddleware);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// General API rate limiting
app.use(apiLimiter);

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    data: {
      status: 'operational',
      timestamp: new Date().toISOString(),
      environment: config.NODE_ENV,
    },
  });
});

/**
 * API Routes
 */

// Authentication routes
app.use('/api/auth', authRoutes);

// Equipment routes
app.use('/api/equipment', equipmentRoutes);

// Maintenance team routes
app.use('/api/teams', teamRoutes);

// Maintenance request routes
app.use('/api/requests', requestRoutes);

/**
 * 404 Not Found Handler
 */
app.use(notFoundHandler);

/**
 * Global Error Handler (must be last)
 */
app.use(errorHandler);

module.exports = app;
