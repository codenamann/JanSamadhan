import Citizen from "../models/Citizen.js";
import jwt from "jsonwebtoken";
import { generateOTP, isOTPExpired } from "../utils/otp.js";
import OTPSchema from './models/TempOTP.js';
import { citizenSignup, getOTP, isPhoneRegistered, sendOTP } from "../utils/citizen.js";
// import sendSMS from './utils/sendSMS.js';

export const citizenSignin = async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: "Phone number is required" });
    const citizenExists = await isPhoneRegistered(phone);
    if (!citizenExists) {
        const otp = await citizenSignup(phone);
        console.log(`OTP sent to phone: ${otp}`);
        return res.status(200).json({ message: "OTP sent to phone" });
    }else{
        const otp = await getOTP(phone);
        console.log(`OTP sent to phone: ${otp}`);
        return res.status(200).json({ message: "OTP sent to phone" });
    }
}

export const resendOTP = async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: "Phone number is required" });
    const citizenExists = await isPhoneRegistered(phone);
    if (!citizenExists) {
        return res.status(400).json({ message: "Phone number not registered" });
    }else{
        const otp = await getOTP(phone);
        console.log(`OTP resent to phone: ${otp}`);
        return res.status(200).json({ message: "OTP resent to phone" });
    }
}

export const verifySignin = async (req, res) => {
    const { phone, otp } = req.body;
    const citizen = await Citizen.findOne({ phone });
    const isValid = await citizen.verifyOTP(otp);
    if(isValid){
        const token = jwt.sign({ id: citizen._id, role: citizen.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(201).json({ message: "Signin complete", token });
    }
    else{
        res.status(400).json({ message: "Invalid or expired OTP" });
    }
}

export const verifySignup = async (req, res) => {
    const { phone, otp } = req.body;
    const isValid = await verifyOTP(phone, otp, true);
    if(isValid){
        res.status(200).json({ message: "OTP verified" });
    }
    else{
        res.status(400).json({ message: "Invalid or expired OTP" });
    } 
}

export const getName = async (req, res) => {
    const { phone, name } = req.body;
    if (!phone || !name) return res.status(400).json({ message: "Phone and name are required" });
    const record = await TempUser.findOne({ phone });
    if (!record) return res.status(400).json({ message: "Record not found" });
    const isPhoneVerified = await record.verified;
    if (!isPhoneVerified) return res.status(400).json({ message: "Phone not verified" });
    await record.deleteOne();
    const newCitizen = new Citizen({ phone, name, isPhoneVerified: true });
    await newCitizen.save();
    const token = jwt.sign({ id: newCitizen._id, role: newCitizen.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ message: "Signup complete", token });
}