import axios from "axios";

export const citizenOTPApi = async(phone) =>{
    const response = await axios.post("http://localhost:5000/api/auth/citizen/login", {phone});
    return response.data;
}

export const citizenVerifyOTP = async(phone, otp) => {
    const response = await axios.post("http://localhost:5000/api/auth/citizen/verify-otp", {phone, otp});
    return response.data;
}

export const citizenSubmitName = async(phone, name) => {
    const response = await axios.patch("http://localhost:5000/api/auth/citizen/submit-name", {phone, name});
    return response.data;
}