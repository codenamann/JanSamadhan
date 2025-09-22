import Citizen from "../models/Citizen.js";
import jwt from "jsonwebtoken";
import { citizenSignup, getOTP, isPhoneRegistered, sendOTP, verifySignin, verifySignup } from "../utils/citizen.js";
import { verifyOTP } from "../utils/otp.js";
import { token } from "morgan";
import TempUser from "../models/TempUser.js";
import { sendSMS } from "../services/smsService.js";
// import sendSMS from './utils/sendSMS.js';

export const citizenSignin = async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({success:false, message: "Phone number is required" });
    const citizenExists = await isPhoneRegistered(phone);
    if (!citizenExists) {
        const otp = await citizenSignup(phone);
        const result = await sendSMS(phone, `Your OTP for signing up in JanSamadhan Portal is ${otp}. It is valid for 5 minutes.`);
        console.log(result);
        console.log(`OTP sent to phone: ${otp}`);
        return res.status(200).json({ success:true, message: "OTP sent to phone" });
    }else{
        const otp = await getOTP(phone);
        const result = await sendSMS(phone, `Your OTP for signing into JanSamadhan Portal is ${otp}. It is valid for 5 minutes.`);
        console.log(result);
        console.log(`OTP sent to phone: ${otp}`);
        return res.status(200).json({success:true, message: "OTP sent to phone" });
    }
}
export const citizenVerify = async (req, res) => {
    const {phone, otp} = req.body;
    if (!phone || !otp) return res.status(400).json({success:false, message: "Phone or OTP missing" });
    const citizenExists = await isPhoneRegistered(phone);
    if(!citizenExists) {
        const result = await verifySignup(phone, otp);
        if (result) {
            res.status(200).json({ success: true, message: "Account created successfully", new: true });
        } else {
            res.status(400).json({ success: false, message: "Account creation failed" });
        }
    }else{
        const result = await verifySignin(phone, otp);
        const citizen = await Citizen.findOne({ phone });
        if(result){
            const token = jwt.sign({ id: citizen._id, phone:citizen.phone, name:citizen.name, role: citizen.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
            const user = { id: citizen._id, name: citizen.name, phone: citizen.phone, role: citizen.role };
            res.status(201).json({success:true, message: "Signin complete", token, user });
        }else{
            res.status(400).json({success:false, message: "Invalid or expired OTP" });
        }
    }
}

export const citizenSubmitName = async (req, res) => {
    const { phone, name } = req.body;
    if (!phone || !name) return res.status(400).json({success:false, message: "Phone or name is missing." });
    const record = await TempUser.findOne({ phone });
    if (!record) return res.status(400).json({success:false, message: "Record not found" });
    await record.deleteOne();
    const newCitizen = new Citizen({ phone, name, isPhoneVerified: true });

    await newCitizen.save();
    const token = jwt.sign({ id: newCitizen._id, role: newCitizen.role, phone:newCitizen.phone }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({success:true, message: "Signup complete", token, user: { id: newCitizen._id, name: newCitizen.name, phone: newCitizen.phone, role: newCitizen.role } });
}

export const resendOTP = async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({success:false, message: "Phone number is required" });
    const citizenExists = await isPhoneRegistered(phone);
    if (!citizenExists) {
        return res.status(400).json({success:false,  message: "Phone number not registered" });
    }else{
        const otp = await getOTP(phone);
        console.log(`OTP resent to phone: ${otp}`);
        return res.status(200).json({success:true, message: "OTP resent to phone" });
    }
}

export const getName = async (req, res) => {
    const { phone, name } = req.body;
    if (!phone || !name) return res.status(400).json({success:false, message: "Phone and name are required" });
    const record = await TempUser.findOne({ phone });
    if (!record) return res.status(400).json({success:false, message: "Record not found" });
    const isPhoneVerified = await record.verified;
    if (!isPhoneVerified) return res.status(400).json({success:false, message: "Phone not verified" });
    await record.deleteOne();
    const newCitizen = new Citizen({ phone, name, isPhoneVerified: true });
    await newCitizen.save();
    const token = jwt.sign({ id: newCitizen._id, role: newCitizen.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({success:true, message: "Signup complete", token });
}