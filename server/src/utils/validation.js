// Validation utility functions for the application

/**
 * Validate complaint data
 * @param {Object} data - Complaint data to validate
 * @returns {Object} - Validation result with isValid boolean and errors array
 */
export const validateComplaintData = (data) => {
  const errors = [];
  const { title, description, reporterId, location } = data;

  // Title validation
  if (!title || typeof title !== 'string') {
    errors.push('Title is required and must be a string');
  } else if (title.trim().length < 5) {
    errors.push('Title must be at least 5 characters long');
  } else if (title.trim().length > 100) {
    errors.push('Title must not exceed 100 characters');
  }

  // Description validation
  if (!description || typeof description !== 'string') {
    errors.push('Description is required and must be a string');
  } else if (description.trim().length < 10) {
    errors.push('Description must be at least 10 characters long');
  } else if (description.trim().length > 1000) {
    errors.push('Description must not exceed 1000 characters');
  }

  // Reporter ID validation
  if (!reporterId || typeof reporterId !== 'string') {
    errors.push('Reporter ID is required and must be a string');
  } else if (reporterId.trim().length < 3) {
    errors.push('Reporter ID must be at least 3 characters long');
  }

  // Location validation
  if (!location || typeof location !== 'object') {
    errors.push('Location is required and must be an object');
  } else {
    if (typeof location.lat !== 'number' || isNaN(location.lat)) {
      errors.push('Location latitude must be a valid number');
    } else if (location.lat < -90 || location.lat > 90) {
      errors.push('Location latitude must be between -90 and 90');
    }

    if (typeof location.lon !== 'number' || isNaN(location.lon)) {
      errors.push('Location longitude must be a valid number');
    } else if (location.lon < -180 || location.lon > 180) {
      errors.push('Location longitude must be between -180 and 180');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format (Indian format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid phone format
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
};

/**
 * Sanitize string input
 * @param {string} str - String to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>\"']/g, '');
};

/**
 * Validate MongoDB ObjectId format
 * @param {string} id - ID to validate
 * @returns {boolean} - True if valid ObjectId format
 */
export const isValidObjectId = (id) => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

/**
 * Validate priority level
 * @param {string} priority - Priority to validate
 * @returns {boolean} - True if valid priority
 */
export const isValidPriority = (priority) => {
  const validPriorities = ['Low', 'Medium', 'High', 'Critical'];
  return validPriorities.includes(priority);
};

/**
 * Validate status
 * @param {string} status - Status to validate
 * @returns {boolean} - True if valid status
 */
export const isValidStatus = (status) => {
  const validStatuses = ['Pending', 'In Progress', 'Resolved'];
  return validStatuses.includes(status);
};

/**
 * Validate category
 * @param {string} category - Category to validate
 * @returns {boolean} - True if valid category
 */
export const isValidCategory = (category) => {
  const validCategories = ['Infrastructure', 'Sanitation', 'Traffic', 'Public Safety', 'Environment', 'Other'];
  return validCategories.includes(category);
};