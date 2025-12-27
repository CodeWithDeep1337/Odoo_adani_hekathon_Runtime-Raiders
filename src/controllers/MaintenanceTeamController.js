/**
 * Maintenance Team Controller
 * Handles maintenance team management endpoints
 */

const { asyncHandler } = require('../middleware/errorHandler');
const MaintenanceTeamService = require('../services/MaintenanceTeamService');

class MaintenanceTeamController {
  /**
   * Create team
   * POST /api/teams
   */
  createTeam = asyncHandler(async (req, res) => {
    const team = await MaintenanceTeamService.createTeam(req.body);

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      data: { team },
    });
  });

  /**
   * Get all teams
   * GET /api/teams
   */
  getAllTeams = asyncHandler(async (req, res) => {
    const { name } = req.query;

    const filters = {};
    if (name) filters.name = name;

    const teams = await MaintenanceTeamService.getAllTeams(filters);

    res.status(200).json({
      success: true,
      message: 'Teams retrieved successfully',
      data: {
        count: teams.length,
        teams,
      },
    });
  });

  /**
   * Get team by ID
   * GET /api/teams/:id
   */
  getTeamById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const team = await MaintenanceTeamService.getTeamById(id);

    res.status(200).json({
      success: true,
      message: 'Team retrieved successfully',
      data: { team },
    });
  });

  /**
   * Update team
   * PUT /api/teams/:id
   */
  updateTeam = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const team = await MaintenanceTeamService.updateTeam(id, req.body);

    res.status(200).json({
      success: true,
      message: 'Team updated successfully',
      data: { team },
    });
  });

  /**
   * Delete team
   * DELETE /api/teams/:id
   */
  deleteTeam = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await MaintenanceTeamService.deleteTeam(id);

    res.status(200).json({
      success: true,
      message: result.message,
      data: {},
    });
  });

  /**
   * Add team member
   * POST /api/teams/:id/members
   */
  addTeamMember = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { userId, role } = req.body;

    const result = await MaintenanceTeamService.addTeamMember(id, userId, role);

    res.status(200).json({
      success: true,
      message: result.message,
      data: {},
    });
  });

  /**
   * Remove team member
   * DELETE /api/teams/:id/members/:userId
   */
  removeTeamMember = asyncHandler(async (req, res) => {
    const { id, userId } = req.params;

    const result = await MaintenanceTeamService.removeTeamMember(id, userId);

    res.status(200).json({
      success: true,
      message: result.message,
      data: {},
    });
  });

  /**
   * Get team members
   * GET /api/teams/:id/members
   */
  getTeamMembers = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const members = await MaintenanceTeamService.getTeamMembers(id);

    res.status(200).json({
      success: true,
      message: 'Team members retrieved successfully',
      data: {
        count: members.length,
        members,
      },
    });
  });
}

module.exports = new MaintenanceTeamController();
