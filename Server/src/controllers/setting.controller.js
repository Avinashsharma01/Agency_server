import settingService from '../services/setting.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/index.js';

/**
 * Setting Controller.
 * Handles HTTP requests for singleton website settings.
 */
class SettingController {
  /**
   * GET /api/v1/settings
   * Fetches global website settings (Public — needed by frontend for rendering).
   */
  getSettings = asyncHandler(async (req, res) => {
    const settings = await settingService.getSettings();

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(settings, 'Settings fetched successfully')
    );
  });

  /**
   * PUT /api/v1/settings
   * Updates global website settings (Protected: Admin only).
   */
  updateSettings = asyncHandler(async (req, res) => {
    const settings = await settingService.updateSettings(req.body);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(settings, 'Settings updated successfully')
    );
  });
}

export default new SettingController();
