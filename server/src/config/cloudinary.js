import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Upload image to Cloudinary
 * @param {Buffer|string} file - File buffer or base64 string
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
export const uploadToCloudinary = async (file, options = {}) => {
  try {
    const uploadOptions = {
      folder: 'jan-samadhan/issues',
      resource_type: 'auto',
      quality: 'auto',
      format: 'auto',
      ...options
    };

    const result = await cloudinary.uploader.upload(file, uploadOptions);
    
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Delete result
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    
    return {
      success: result.result === 'ok',
      result: result.result
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get optimized image URL
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} transformations - Image transformations
 * @returns {string} Optimized URL
 */
export const getOptimizedImageURL = (publicId, transformations = {}) => {
  const {
    width = 400,
    height = 300,
    crop = 'fill',
    quality = 'auto',
    format = 'auto'
  } = transformations;

  return cloudinary.url(publicId, {
    width,
    height,
    crop,
    quality,
    format
  });
};

export default cloudinary;
