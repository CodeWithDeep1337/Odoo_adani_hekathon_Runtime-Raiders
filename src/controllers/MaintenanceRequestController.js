/**
 * Maintenance Request Controller
 * Handles maintenance request endpoints with Kanban and calendar logic
 */

const { asyncHandler } = require('../middleware/errorHandler');
const MaintenanceRequestService = require('../services/MaintenanceRequestService');

class MaintenanceRequestController {
  /**
   * Create maintenance request
   * POST /api/requests
   */
  createRequest = asyncHandler(async (req, res) => {
    const request = await MaintenanceRequestService.createMaintenanceRequest(
      req.body,
      req.user.id
    );

    res.status(201).json({
      success: true,
      message: 'Maintenance request created successfully',
      data: { request },
    });
  });

  /**
   * Get all maintenance requests
   * GET /api/requests
   */
  getAllRequests = asyncHandler(async (req, res) => {
    const { status, equipmentId, teamId, type, priority } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (equipmentId) filters.equipmentId = equipmentId;
    if (teamId) filters.teamId = teamId;
    if (type) filters.type = type;
    if (priority) filters.priority = priority;

    const requests = await MaintenanceRequestService.getAllMaintenanceRequests(filters);

    res.status(200).json({
      success: true,
      message: 'Maintenance requests retrieved successfully',
      data: {
        count: requests.length,
        requests,
      },
    });
  });

  /**
   * Get request by ID
   * GET /api/requests/:id
   */
  getRequestById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const request = await MaintenanceRequestService.getMaintenanceRequestById(id);

    res.status(200).json({
      success: true,
      message: 'Maintenance request retrieved successfully',
      data: { request },
    });
  });

  /**
   * Update maintenance request
   * PUT /api/requests/:id
   */
  updateRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const request = await MaintenanceRequestService.updateMaintenanceRequest(id, req.body);

    res.status(200).json({
      success: true,
      message: 'Maintenance request updated successfully',
      data: { request },
    });
  });

  /**
   * **CRITICAL: Update request status (Kanban workflow)**
   * PATCH /api/requests/:id/status
   * Enforces valid status transitions
   */
  updateStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const request = await MaintenanceRequestService.updateStatus(id, status);

    res.status(200).json({
      success: true,
      message: 'Maintenance request status updated successfully',
      data: { request },
    });
  });

  /**
   * **CRITICAL: Calendar endpoint (NO PAST DATES)**
   * GET /api/requests/calendar?month=&year=
   * Returns PREVENTIVE maintenance only for the specified month/year
   */
  getCalendar = asyncHandler(async (req, res) => {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'month and year query parameters are required',
        data: {},
      });
    }

    const calendar = await MaintenanceRequestService.getCalendar(
      parseInt(month),
      parseInt(year)
    );

    res.status(200).json({
      success: true,
      message: 'Calendar retrieved successfully',
      data: calendar,
    });
  });

  /**
   * Delete maintenance request
   * DELETE /api/requests/:id
   */
  deleteRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await MaintenanceRequestService.deleteMaintenanceRequest(id);

    res.status(200).json({
      success: true,
      message: result.message,
      data: {},
    });
  });
}

module.exports = new MaintenanceRequestController();
