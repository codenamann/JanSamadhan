import mongoose from "mongoose";

const authoritySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email"
      ]
    },
    department: {
      type: String,
      required: [true, "Please provide a department"],
      trim: true
    },
    designation: {
      type: String,
      required: [true, "Please provide a designation"],
      trim: true
    },
    phone: {
      type: String,
      required: [true, "Please provide a phone number"],
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLogin: {
      type: Date,
      default: null
    },
    otp: {
      code: {
        type: String,
        default: null
      },
      expiresAt: {
        type: Date,
        default: null
      }
    }
  },
  {
    timestamps: true
  }
);

// Add indexes for better performance
authoritySchema.index({ email: 1 });
authoritySchema.index({ isActive: 1 });

const Authority = mongoose.model("Authority", authoritySchema);

export default Authority;
