import TempUser from "../models/TempUser.js";
import Citizen from "../models/Citizen.js";

export const generateOTP = (length = 6) => {
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += Math.floor(Math.random() * 10);
    }
    return otp;
};

export const saveTempOTP = async (phone, otp, ttlSeconds = 300) => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlSeconds * 1000);
  
    await TempUser.updateOne(
        { phone },               
        { $set: { otp, createdAt: new Date() } },
        { upsert: true }
    );
    
};

export const saveOTP = async (phone, otp, ttlSeconds = 300) => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlSeconds * 1000);
    const citizen = Citizen.findOne({ phone });
    if (!citizen) throw new Error("Citizen not found");
    citizen.setOtp(otp, expiresAt)
    await citizen.save();
};
  

export const verifyOTP = async (phone, otp, temp = false) => {
    let user = null;
    if (temp) {
        user = TempUser;
    }else{
        user = Citizen;
    }
    const record = await user.findOne({ phone });
    if (!record){
        console.log("no record found");
        return false; // no OTP sent
    }
    if (record.otp !== otp) {
        console.log("invalid OTP");
        return false; // invalid OTP
    }
    const now = new Date();
    if (record.expiresAt < now) return false; // expired
    record.verified = true;
    return true;
};

export const sendOTPToPhone = async (phone, otp) => {
    await sendSMS(phone, `Your OTP is ${otp}`);
};
  