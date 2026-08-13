import teamMemberService from '../services/teamMember.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/index.js';

/**
 * TeamMember Controller.
 * Handles HTTP requests for staff and team members.
 */
class TeamMemberController {
  /**
   * POST /api/v1/team
   * Creates a new team member (Protected: Admin/Manager).
   */
  createMember = asyncHandler(async (req, res) => {
    const member = await teamMemberService.createMember(req.body);

    res.status(HTTP_STATUS.CREATED).json(
      ApiResponse.created(member, 'Team member created successfully')
    );
  });

  /**
   * GET /api/v1/team
   * Gets paginated team members (Public).
   */
  getMembers = asyncHandler(async (req, res) => {
    const { data, pagination } = await teamMemberService.getMembers(req.query);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.paginated(data, pagination, 'Team members fetched successfully')
    );
  });

  /**
   * GET /api/v1/team/active
   * Gets all active team members (unpaginated) (Public).
   */
  getActiveMembers = asyncHandler(async (req, res) => {
    const members = await teamMemberService.getActiveMembers();

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(members, 'Active team members fetched successfully')
    );
  });

  /**
   * GET /api/v1/team/:id
   * Gets a team member by ID (Public).
   */
  getMemberById = asyncHandler(async (req, res) => {
    const member = await teamMemberService.getMemberById(req.params.id);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(member, 'Team member fetched successfully')
    );
  });

  /**
   * PUT /api/v1/team/:id
   * Updates a team member by ID (Protected: Admin/Manager).
   */
  updateMember = asyncHandler(async (req, res) => {
    const member = await teamMemberService.updateMember(req.params.id, req.body);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(member, 'Team member updated successfully')
    );
  });

  /**
   * DELETE /api/v1/team/:id
   * Deletes a team member by ID (Protected: Admin/Manager).
   */
  deleteMember = asyncHandler(async (req, res) => {
    await teamMemberService.deleteMember(req.params.id);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(null, 'Team member deleted successfully')
    );
  });
}

export default new TeamMemberController();
