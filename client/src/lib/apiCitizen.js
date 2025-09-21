import axios from "axios";
const apiUrl = import.meta.env.VITE_SERVER_URL;
console.log("API URL:", apiUrl);

export const citizenOTPApi = async(phone) =>{
    const response = await axios.post(`${apiUrl}/api/auth/citizen/login`, {phone});
    return response.data;
}

export const citizenVerifyOTP = async(phone, otp) => {
    const response = await axios.post(`${apiUrl}/api/auth/citizen/verify-otp`, {phone, otp});
    return response.data;
}

export const citizenSubmitName = async(phone, name) => {
    const response = await axios.patch(`${apiUrl}/api/auth/citizen/submit-name`, {phone, name});
    return response.data;
}

// Complaint API functions
export const getAllComplaints = async (params = {}) => {
    const response = await axios.get(`${apiUrl}/api/complaints`, { params });
    return response.data;
}

export const getComplaintsByUser = async (userId, params = {}) => {
    const response = await axios.get(`${apiUrl}/api/complaints/user/${userId}`, { params });
    return response.data;
}

export const getComplaintById = async (complaintId) => {
    const response = await axios.get(`${apiUrl}/api/complaints/${complaintId}`);
    return response.data;
}

export const createComplaint = async (complaintData) => {
    const response = await axios.post(`${apiUrl}/api/complaints`, complaintData);
    return response.data;
}

export const getComplaintStats = async () => {
    const response = await axios.get(`${apiUrl}/api/complaints/stats`);
    return response.data;
}

// Authority API functions
export const authorityOTPApi = async (email) => {
    const response = await axios.post(`${apiUrl}/api/auth/authority/login`, { email });
    return response.data;
}

export const authorityVerifyOTP = async (email, otp) => {
    const response = await axios.post(`${apiUrl}/api/auth/authority/verify-otp`, { email, otp });
    return response.data;
}

export const getAuthorityProfile = async (token) => {
    const response = await axios.get(`${apiUrl}/api/auth/authority/profile`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
}

export const updateAuthorityProfile = async (profileData, token) => {
    const response = await axios.put(`${apiUrl}/api/auth/authority/profile`, profileData, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
}