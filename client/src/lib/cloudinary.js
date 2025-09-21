// Cloudinary configuration and utilities
import { Cloudinary } from '@cloudinary/url-gen';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { auto } from '@cloudinary/url-gen/qualifiers/format';

// Initialize Cloudinary
const cloudinaryCore = new Cloudinary({
  cloud: {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
    apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY,
    apiSecret: import.meta.env.VITE_CLOUDINARY_API_SECRET,
  },
  url: {
    secure: true
  }
});

// Upload preset for unsigned uploads
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Upload image to Cloudinary
 * @param {File|Blob} file - Image file to upload
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
export const uploadToCloudinary = async (file, options = {}) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'jan-samadhan/issues');
    
    // Add any additional options
    Object.keys(options).forEach(key => {
      formData.append(key, options[key]);
    });

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
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
 * Convert file to base64 string
 * @param {File|Blob} file - File to convert
 * @returns {Promise<string>} Base64 string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * Convert file to blob URL
 * @param {File|Blob} file - File to convert
 * @returns {string} Blob URL
 */
export const fileToBlobURL = (file) => {
  return URL.createObjectURL(file);
};

/**
 * Create image preview with fallback options
 * @param {File|Blob} file - Image file
 * @param {Object} options - Preview options
 * @returns {Promise<Object>} Preview data
 */
export const createImagePreview = async (file, options = {}) => {
  const { useBase64 = true, useBlobURL = true, uploadToCloud = false } = options;
  
  const preview = {
    file,
    base64: null,
    blobURL: null,
    cloudinaryURL: null,
    error: null
  };

  try {
    // Create base64 preview
    if (useBase64) {
      preview.base64 = await fileToBase64(file);
    }

    // Create blob URL preview
    if (useBlobURL) {
      preview.blobURL = fileToBlobURL(file);
    }

    // Upload to Cloudinary if requested
    if (uploadToCloud) {
      const uploadResult = await uploadToCloudinary(file);
      if (uploadResult.success) {
        preview.cloudinaryURL = uploadResult.url;
      } else {
        preview.error = uploadResult.error;
      }
    }

    return preview;
  } catch (error) {
    console.error('Error creating image preview:', error);
    preview.error = error.message;
    return preview;
  }
};

/**
 * Clean up blob URLs to prevent memory leaks
 * @param {string|Array<string>} urls - Blob URL(s) to revoke
 */
export const cleanupBlobURLs = (urls) => {
  const urlArray = Array.isArray(urls) ? urls : [urls];
  urlArray.forEach(url => {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  });
};

/**
 * Get optimized image URL from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} transformations - Image transformations
 * @returns {string} Optimized URL
 */
export const getOptimizedImageURL = (publicId, transformations = {}) => {
  const {
    width = 400,
    height = 300,
    quality: qualityValue = 'auto',
    format: formatValue = 'auto'
  } = transformations;

  const image = cloudinaryCore.image(publicId);
  
  // Apply transformations
  image.resize(fill(width, height));
  image.quality(qualityValue);
  image.format(auto());
  
  return image.toURL();
};

export default cloudinaryCore;
