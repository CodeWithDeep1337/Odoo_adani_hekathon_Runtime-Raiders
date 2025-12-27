/**
 * Maintenance Team Routes
 */

const express = require('express');
const { validateBody } = require('../middleware/validationMiddleware');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const {
  teamSchema,
  teamUpdateSchema,
} = require('../validations/schemas');
const MaintenanceTeamController = require('../controllers/MaintenanceTeamController');

const router = express.Router();

// All team routes require authentication
router.use(authMiddleware);

/**
 * Public team routes (all authenticated users can view)
 */

// GET all teams
router.get('/', MaintenanceTeamController.getAllTeams);

// GET team by ID
router.get('/:id', MaintenanceTeamController.getTeamById);

// GET team members
router.get('/:id/members', MaintenanceTeamController.getTeamMembers);

/**
 * Protected team routes (ADMIN, MANAGER only)
 */

// POST create team
router.post('/', roleMiddleware('ADMIN', 'MANAGER'), validateBody(teamSchema), MaintenanceTeamController.createTeam);

// PUT update team
router.put('/:id', roleMiddleware('ADMIN', 'MANAGER'), validateBody(teamUpdateSchema), MaintenanceTeamController.updateTeam);

// DELETE team
router.delete('/:id', roleMiddleware('ADMIN', 'MANAGER'), MaintenanceTeamController.deleteTeam);

// POST add team member
router.post('/:id/members', roleMiddleware('ADMIN', 'MANAGER'), MaintenanceTeamController.addTeamMember);

// DELETE remove team member
router.delete('/:id/members/:userId', roleMiddleware('ADMIN', 'MANAGER'), MaintenanceTeamController.removeTeamMember);

module.exports = router;
