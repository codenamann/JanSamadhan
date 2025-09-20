import Citizen from "../models/Citizen.js";
import { generateOTP, saveOTP, saveTempOTP } from "./otp.js";

export const citizenSignup = async (phone) => {
    const otp = generateOTP();
    await saveTempOTP(phone, otp);
    return otp;
};

export const isPhoneRegistered = async (phone) => {
    const existing = await Citizen.findOne({ phone });
    return !!existing; // true if exists
};

export const sendOTP = async (phone) => {
    const otp = generateOTP();
    await saveOTP(phone, otp);
    // Here you would integrate with an SMS service to send the OTP
    console.log(`Sending OTP ${otp} to phone ${phone}`);
    return otp;
};

export const getOTP = async (phone) => {
    const citizen = Citizen.findOne({ phone });
    const otp = generateOTP();
    await citizen.setOtp(otp, 300);
    return otp;
}