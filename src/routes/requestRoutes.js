/**
 * Maintenance Request Routes
 * Includes Calendar endpoint (CRITICAL - no past dates allowed)
 */

const express = require('express');
const { validateBody, validateQuery } = require('../middleware/validationMiddleware');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const {
  maintenanceRequestSchema,
  maintenanceRequestUpdateSchema,
  statusUpdateSchema,
  calendarSchema,
} = require('../validations/schemas');
const MaintenanceRequestController = require('../controllers/MaintenanceRequestController');

const router = express.Router();

// All request routes require authentication
router.use(authMiddleware);

/**
 * Public maintenance request routes (all authenticated users)
 */

// GET all maintenance requests (with optional filters)
router.get('/', MaintenanceRequestController.getAllRequests);

// GET maintenance request by ID
router.get('/:id', MaintenanceRequestController.getRequestById);

/**
 * **CRITICAL CALENDAR ENDPOINT**
 * GET /api/requests/calendar?month=&year=
 * Returns PREVENTIVE maintenance only
 * NO PAST DATES ALLOWED - server validates
 */
router.get('/calendar/view', validateQuery(calendarSchema), MaintenanceRequestController.getCalendar);

/**
 * Protected maintenance request routes (MANAGER, TECHNICIAN, ADMIN)
 */

// POST create maintenance request (allow all authenticated users)
router.post('/', validateBody(maintenanceRequestSchema), MaintenanceRequestController.createRequest);

// PUT update maintenance request
router.put('/:id', roleMiddleware('ADMIN', 'MANAGER', 'TECHNICIAN'), validateBody(maintenanceRequestUpdateSchema), MaintenanceRequestController.updateRequest);

/**
 * **KANBAN STATUS UPDATE**
 * PATCH /api/requests/:id/status
 * Enforces valid status transitions:
 * NEW → IN_PROGRESS or SCRAP
 * IN_PROGRESS → REPAIRED or SCRAP
 */
router.patch('/:id/status', roleMiddleware('ADMIN', 'MANAGER', 'TECHNICIAN'), validateBody(statusUpdateSchema), MaintenanceRequestController.updateStatus);

// DELETE maintenance request (only NEW status)
router.delete('/:id', roleMiddleware('ADMIN', 'MANAGER'), MaintenanceRequestController.deleteRequest);

module.exports = router;
