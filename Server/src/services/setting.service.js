import settingRepository from '../repositories/setting.repository.js';

/**
 * Setting Service.
 * Business logic for singleton website settings management.
 */
class SettingService {
  /**
   * Gets the singleton website settings document.
   *
   * @returns {Promise<object>} Settings document
   */
  async getSettings() {
    return settingRepository.getSingleton();
  }

  /**
   * Updates the singleton website settings document.
   *
   * @param {object} updateData - Settings fields to update
   * @returns {Promise<object>} Updated settings document
   */
  async updateSettings(updateData) {
    return settingRepository.updateSingleton(updateData);
  }
}

export default new SettingService();
