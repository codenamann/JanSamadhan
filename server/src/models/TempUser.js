import mongoose from "mongoose";
const { Schema } = mongoose;

const tempUserSchema = new Schema({
    name: { type: String },
    phone: { type: String, required: true, unique: true },
    otp: { type: String, required: true },
    otpLastSentAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
});

tempCitizenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("TempUser", tempUserSchema);