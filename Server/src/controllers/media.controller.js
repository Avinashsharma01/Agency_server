import mediaService from '../services/media.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/index.js';

/**
 * Media Controller.
 * Handles HTTP requests for Cloudinary media uploads and library management.
 */
class MediaController {
  /**
   * POST /api/v1/media
   * Uploads a single media file (Protected: Admin/Manager/Editor).
   */
  uploadMedia = asyncHandler(async (req, res) => {
    const metadata = {
      folder: req.body.folder || 'general',
      alt: req.body.alt || '',
      caption: req.body.caption || '',
    };

    const media = await mediaService.uploadMedia(req.file, req.user.id, metadata);

    res.status(HTTP_STATUS.CREATED).json(
      ApiResponse.created(media, 'Media uploaded successfully')
    );
  });

  /**
   * POST /api/v1/media/multiple
   * Uploads multiple media files (Protected: Admin/Manager/Editor).
   */
  uploadMultipleMedia = asyncHandler(async (req, res) => {
    const folder = req.body.folder || 'general';
    const mediaList = await mediaService.uploadMultipleMedia(req.files, req.user.id, folder);

    res.status(HTTP_STATUS.CREATED).json(
      ApiResponse.created(mediaList, `${mediaList.length} media file(s) uploaded successfully`)
    );
  });

  /**
   * GET /api/v1/media
   * Gets paginated media library (Protected: Admin/Manager/Editor).
   */
  getMedia = asyncHandler(async (req, res) => {
    const { data, pagination } = await mediaService.getMedia(req.query);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.paginated(data, pagination, 'Media library fetched successfully')
    );
  });

  /**
   * GET /api/v1/media/:id
   * Gets media by ID (Protected: Admin/Manager/Editor).
   */
  getMediaById = asyncHandler(async (req, res) => {
    const media = await mediaService.getMediaById(req.params.id);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(media, 'Media fetched successfully')
    );
  });

  /**
   * PUT /api/v1/media/:id
   * Updates media metadata (alt, caption, folder) (Protected: Admin/Manager/Editor).
   */
  updateMedia = asyncHandler(async (req, res) => {
    const media = await mediaService.updateMedia(req.params.id, req.body);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(media, 'Media updated successfully')
    );
  });

  /**
   * DELETE /api/v1/media/:id
   * Deletes media from Cloudinary and soft deletes (Protected: Admin/Manager/Editor).
   */
  deleteMedia = asyncHandler(async (req, res) => {
    await mediaService.deleteMedia(req.params.id);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(null, 'Media deleted successfully')
    );
  });
}

export default new MediaController();
