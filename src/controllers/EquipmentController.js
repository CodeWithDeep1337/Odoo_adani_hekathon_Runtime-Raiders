/**
 * Equipment Controller
 * Handles equipment endpoints
 */

const { asyncHandler } = require('../middleware/errorHandler');
const EquipmentService = require('../services/EquipmentService');

class EquipmentController {
  /**
   * Create new equipment
   * POST /api/equipment
   */
  createEquipment = asyncHandler(async (req, res) => {
    const equipment = await EquipmentService.createEquipment(req.body);

    res.status(201).json({
      success: true,
      message: 'Equipment created successfully',
      data: { equipment },
    });
  });

  /**
   * Get all equipment
   * GET /api/equipment
   */
  getAllEquipment = asyncHandler(async (req, res) => {
    const { department, isScrapped, maintenanceTeamId } = req.query;

    const filters = {};
    if (department) filters.department = department;
    if (isScrapped !== undefined) filters.isScrapped = isScrapped === 'true';
    if (maintenanceTeamId) filters.maintenanceTeamId = maintenanceTeamId;

    const equipment = await EquipmentService.getAllEquipment(filters);

    res.status(200).json({
      success: true,
      message: 'Equipment retrieved successfully',
      data: {
        count: equipment.length,
        equipment,
      },
    });
  });

  /**
   * Get equipment by ID
   * GET /api/equipment/:id
   */
  getEquipmentById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const equipment = await EquipmentService.getEquipmentById(id);

    res.status(200).json({
      success: true,
      message: 'Equipment retrieved successfully',
      data: { equipment },
    });
  });

  /**
   * Update equipment
   * PUT /api/equipment/:id
   */
  updateEquipment = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const equipment = await EquipmentService.updateEquipment(id, req.body);

    res.status(200).json({
      success: true,
      message: 'Equipment updated successfully',
      data: { equipment },
    });
  });

  /**
   * Delete equipment
   * DELETE /api/equipment/:id
   */
  deleteEquipment = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await EquipmentService.deleteEquipment(id);

    res.status(200).json({
      success: true,
      message: result.message,
      data: {},
    });
  });

  /**
   * Get equipment warranty status
   * GET /api/equipment/:id/warranty
   */
  getWarrantyStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const warranty = await EquipmentService.getWarrantyStatus(id);

    res.status(200).json({
      success: true,
      message: 'Warranty status retrieved',
      data: warranty,
    });
  });
}

module.exports = new EquipmentController();
