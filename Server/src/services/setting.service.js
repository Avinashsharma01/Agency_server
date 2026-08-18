import settingRepository from '../repositories/setting.repository.js';
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from '../helpers/cloudinary.helper.js';
import { CLOUDINARY_FOLDERS } from '../constants/index.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';
import fs from 'fs/promises';

/**
 * Setting Service.
 * Business logic for singleton website settings management.
 * Handles text settings updates and image uploads for logo, favicon, and OG image.
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

  /**
   * Uploads/replaces the site logo image.
   *
   * @param {object} file - Multer file object
   * @returns {Promise<object>} Updated settings document
   */
  async updateLogo(file) {
    if (!file) {
      throw ApiError.badRequest('Logo image is required');
    }

    const settings = await settingRepository.getSingleton();

    // Delete old logo from Cloudinary if exists
    if (settings.siteLogo?.publicId) {
      try {
        await deleteFromCloudinary(settings.siteLogo.publicId);
      } catch (error) {
        logger.warn(`Failed to delete old logo: ${error.message}`);
      }
    }

    // Upload new logo
    const result = await uploadToCloudinary(file.path, CLOUDINARY_FOLDERS.SETTINGS, {
      transformation: [
        { width: 400, height: 150, crop: 'limit' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    });

    // Clean up temp file
    try {
      await fs.unlink(file.path);
    } catch (error) {
      logger.warn(`Failed to delete temp file: ${file.path}`);
    }

    return settingRepository.updateSingleton({
      siteLogo: {
        publicId: result.publicId,
        url: result.secureUrl,
      },
    });
  }

  /**
   * Uploads/replaces the favicon image.
   *
   * @param {object} file - Multer file object
   * @returns {Promise<object>} Updated settings document
   */
  async updateFavicon(file) {
    if (!file) {
      throw ApiError.badRequest('Favicon image is required');
    }

    const settings = await settingRepository.getSingleton();

    // Delete old favicon from Cloudinary if exists
    if (settings.favicon?.publicId) {
      try {
        await deleteFromCloudinary(settings.favicon.publicId);
      } catch (error) {
        logger.warn(`Failed to delete old favicon: ${error.message}`);
      }
    }

    // Upload new favicon
    const result = await uploadToCloudinary(file.path, CLOUDINARY_FOLDERS.SETTINGS, {
      transformation: [
        { width: 64, height: 64, crop: 'fill' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    });

    // Clean up temp file
    try {
      await fs.unlink(file.path);
    } catch (error) {
      logger.warn(`Failed to delete temp file: ${file.path}`);
    }

    return settingRepository.updateSingleton({
      favicon: {
        publicId: result.publicId,
        url: result.secureUrl,
      },
    });
  }

  /**
   * Uploads/replaces the SEO Open Graph image.
   *
   * @param {object} file - Multer file object
   * @returns {Promise<object>} Updated settings document
   */
  async updateOgImage(file) {
    if (!file) {
      throw ApiError.badRequest('OG image is required');
    }

    const settings = await settingRepository.getSingleton();

    // Delete old OG image from Cloudinary if exists
    if (settings.seo?.ogImage?.publicId) {
      try {
        await deleteFromCloudinary(settings.seo.ogImage.publicId);
      } catch (error) {
        logger.warn(`Failed to delete old OG image: ${error.message}`);
      }
    }

    // Upload new OG image (1200x630 recommended for social sharing)
    const result = await uploadToCloudinary(file.path, CLOUDINARY_FOLDERS.SETTINGS, {
      transformation: [
        { width: 1200, height: 630, crop: 'fill' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    });

    // Clean up temp file
    try {
      await fs.unlink(file.path);
    } catch (error) {
      logger.warn(`Failed to delete temp file: ${file.path}`);
    }

    // Update nested seo.ogImage field
    const currentSeo = settings.seo || {};
    return settingRepository.updateSingleton({
      seo: {
        ...currentSeo.toObject ? currentSeo.toObject() : currentSeo,
        ogImage: {
          publicId: result.publicId,
          url: result.secureUrl,
        },
      },
    });
  }
}

export default new SettingService();
