// API Test utilities for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Test API connection
 */
export const testAPIConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    console.log('✅ API Connection Test:', data);
    return data.success;
  } catch (error) {
    console.error('❌ API Connection Test Failed:', error);
    return false;
  }
};

/**
 * Test image upload endpoint
 */
export const testImageUpload = async (file) => {
  try {
    const result = await fetch(`${API_BASE_URL}/images/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: await fileToBase64(file)
      })
    });

    const data = await result.json();
    console.log('✅ Image Upload Test:', data);
    return data;
  } catch (error) {
    console.error('❌ Image Upload Test Failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Test complaint creation
 */
export const testComplaintCreation = async (complaintData) => {
  try {
    const result = await fetch(`${API_BASE_URL}/complaints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(complaintData)
    });

    const data = await result.json();
    console.log('✅ Complaint Creation Test:', data);
    return data;
  } catch (error) {
    console.error('❌ Complaint Creation Test Failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Convert file to base64
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * Run all API tests
 */
export const runAllTests = async () => {
  console.log('🧪 Running API Tests...');
  
  const connectionTest = await testAPIConnection();
  if (!connectionTest) {
    console.error('❌ API connection failed, skipping other tests');
    return false;
  }
  
  console.log('✅ All API tests passed');
  return true;
};


