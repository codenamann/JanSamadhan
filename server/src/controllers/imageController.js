import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

/**
 * Upload image to Cloudinary
 * POST /api/images/upload
 */
export const uploadImage = async (req, res) => {
  try {
    const { image } = req.body; // Base64 image data
    
    if (!image) {
      return res.status(400).json({
        success: false,
        error: 'No image provided'
      });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(image, {
      folder: 'jan-samadhan/issues',
      transformation: [
        { width: 1200, height: 800, crop: 'limit' },
        { quality: 'auto' },
        { format: 'auto' }
      ]
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      data: {
        url: result.url,
        publicId: result.publicId,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes
      }
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload image'
    });
  }
};

/**
 * Delete image from Cloudinary
 * DELETE /api/images/:publicId
 */
export const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.params;
    
    if (!publicId) {
      return res.status(400).json({
        success: false,
        error: 'No public ID provided'
      });
    }

    const result = await deleteFromCloudinary(publicId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Image delete error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete image'
    });
  }
};

/**
 * Get image info
 * GET /api/images/:publicId/info
 */
export const getImageInfo = async (req, res) => {
  try {
    const { publicId } = req.params;
    
    if (!publicId) {
      return res.status(400).json({
        success: false,
        error: 'No public ID provided'
      });
    }

    // Get image info from Cloudinary
    const result = await cloudinary.api.resource(publicId);

    res.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
        createdAt: result.created_at
      }
    });
  } catch (error) {
    console.error('Get image info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get image info'
    });
  }
};
