// Image API utilities
const API_BASE_URL = import.meta.env.VITE_SERVER_URL;

/**
 * Upload image to server
 * @param {File|Blob} file - Image file to upload
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
export const uploadImage = async (file, options = {}) => {
  try {
    // Convert file to base64
    const base64 = await fileToBase64(file);
    
    const response = await fetch(`${API_BASE_URL}/images/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64,
        ...options
      })
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Image upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Delete image from server
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Delete result
 */
export const deleteImage = async (publicId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/images/${publicId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Delete failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Image delete error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get image info
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Image info
 */
export const getImageInfo = async (publicId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/images/${publicId}/info`);

    if (!response.ok) {
      throw new Error(`Get info failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Get image info error:', error);
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
