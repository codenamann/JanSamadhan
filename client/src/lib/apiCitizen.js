import axios from "axios";
const apiUrl = import.meta.env.VITE_SERVER_URL;
console.log("API URL:", apiUrl);

export const citizenOTPApi = async(phone) =>{
    console.log('api call :',phone);
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