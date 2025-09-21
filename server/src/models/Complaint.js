import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: [true, "Please provide a title for the complaint"],
      trim: true
    },
    description: { 
      type: String,
      trim: true
    },
    status: { 
      type: String, 
      enum: ["Pending", "In Progress", "Resolved"], 
      default: "Pending" 
    },
    reportedBy: {
      name: {
        type: String,
        required: true,
        trim: true
      },
      phone: {
        type: String,
        trim: true,
        default: ""
      },
      id : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      }
    },
    image: { 
      type: String, 
      default: "" 
    },
    cloudinaryPublicId: {
      type: String,
      default: ""
    },
    location: {
      lat: { 
        type: Number, 
        required: [true, "Latitude is required"] 
      },
      lon: { 
        type: Number, 
        required: [true, "Longitude is required"] 
      },
      address: {
        type: String,
        trim: true,
        default: ""
      }
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium"
    },
    category: {
      type: String,
      enum: ["Infrastructure", "Sanitation", "Traffic", "Public Safety", "Environment", "Other"],
      default: "Other"
    }
  },
  { 
    timestamps: true 
  }
);

// Add indexes for better performance
complaintSchema.index({ status: 1 });
complaintSchema.index({ reporterId: 1 });
complaintSchema.index({ "location.lat": 1, "location.lon": 1 });

const Complaint = mongoose.model("Complaint", complaintSchema);

export default Complaint;