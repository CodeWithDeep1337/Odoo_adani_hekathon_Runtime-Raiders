/**
 * Equipment Routes
 */

const express = require('express');
const { validateBody, validateQuery } = require('../middleware/validationMiddleware');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const {
  equipmentSchema,
  equipmentUpdateSchema,
} = require('../validations/schemas');
const EquipmentController = require('../controllers/EquipmentController');

const router = express.Router();

// All equipment routes require authentication
router.use(authMiddleware);

/**
 * Public equipment routes (all authenticated users)
 */

// GET all equipment (with optional filters)
router.get('/', EquipmentController.getAllEquipment);

// GET equipment by ID
router.get('/:id', EquipmentController.getEquipmentById);

// GET warranty status
router.get('/:id/warranty', EquipmentController.getWarrantyStatus);

/**
 * Protected equipment routes (ADMIN, MANAGER only)
 */

// POST create equipment
router.post('/', roleMiddleware('ADMIN', 'MANAGER'), validateBody(equipmentSchema), EquipmentController.createEquipment);

// PUT update equipment
router.put('/:id', roleMiddleware('ADMIN', 'MANAGER'), validateBody(equipmentUpdateSchema), EquipmentController.updateEquipment);

// DELETE equipment
router.delete('/:id', roleMiddleware('ADMIN', 'MANAGER'), EquipmentController.deleteEquipment);

module.exports = router;
