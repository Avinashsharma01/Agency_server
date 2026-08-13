import Setting from '../models/Setting.model.js';

/**
 * Setting Repository.
 * Data access layer for singleton website settings.
 */
class SettingRepository {
  /**
   * Returns the singleton settings document (creates with defaults if not found).
   *
   * @returns {Promise<Document>}
   */
  async getSingleton() {
    return Setting.getSingleton();
  }

  /**
   * Updates the singleton settings document.
   *
   * @param {object} updateData - Fields to update
   * @returns {Promise<Document>} Updated settings
   */
  async updateSingleton(updateData) {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create(updateData);
    } else {
      Object.assign(settings, updateData);
      await settings.save();
    }
    return settings;
  }
}

export default new SettingRepository();
