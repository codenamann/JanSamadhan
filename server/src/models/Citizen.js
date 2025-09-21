import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema } = mongoose;

const citizenSchema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    role: { type: String, default: "citizen" },

    // OTP fields
    otpHash: { type: String },
    otpExpiresAt: { type: Date },
    otpAttemptCount: { type: Number, default: 0 },
    otpLastSentAt: { type: Date },

    // Status flags
    isPhoneVerified: { type: Boolean, default: false },
    lastLoginAt: { type: Date },

    // Notifications
    notifications: [{
      id: { type: String, required: true },
      type: { 
        type: String, 
        enum: ['complaint_status', 'complaint_resolved', 'otp', 'general'],
        required: true 
      },
      title: { type: String, required: true },
      message: { type: String, required: true },
      complaintId: { type: String },
      isRead: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    }]
  },
  { timestamps: true }
);

// Index for quick lookup by phone
citizenSchema.index({ phone: 1 }, { unique: true });

/**
 * Set a new OTP for this citizen.
 * @param {string} otpCode - The OTP to set
 * @param {number} ttlSeconds - Time-to-live in seconds (default: 300s)
 */
citizenSchema.methods.setOtp = async function (otpCode, ttlSeconds = 300) {
  this.otpHash = await bcrypt.hash(otpCode, 10);
  this.otpExpiresAt = new Date(Date.now() + ttlSeconds * 1000);
  this.otpAttemptCount = 0;
  this.otpLastSentAt = new Date();
  await this.save();
};

/**
 * Verify an OTP and update citizen status.
 * @param {string} otpCode - The OTP to verify
 * @returns {Promise<boolean>} true if valid, false otherwise
 */
citizenSchema.methods.verifyOtp = async function (otpCode) {
  if (!this.otpHash || !this.otpExpiresAt) return false;
  if (this.otpExpiresAt.getTime() < Date.now()) return false;

  const isMatch = await bcrypt.compare(otpCode, this.otpHash);
  if (!isMatch) {
    this.otpAttemptCount += 1;
    await this.save();
    return false;
  }

  // OTP is valid
  this.otpHash = undefined;
  this.otpExpiresAt = undefined;
  this.otpAttemptCount = 0;
  this.isPhoneVerified = true;
  this.lastLoginAt = new Date();
  await this.save();

  return true;
};

export default mongoose.model("Citizen", citizenSchema);
