import Complaint from "../models/Complaint.js";
import { validateComplaintData } from "../utils/validation.js";

// @desc    Get all complaints with filtering
// @route   GET /api/complaints
// @access  Public
export const getAllComplaints = async (req, res) => {
  try {
    const { status, reporterId, category, priority, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (reporterId) filter.reporterId = reporterId;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    
    // Pagination
    const skip = (page - 1) * limit;
    const totalComplaints = await Complaint.countDocuments(filter);
    const complaints = await Complaint.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      count: complaints.length,
      total: totalComplaints,
      page: parseInt(page),
      totalPages: Math.ceil(totalComplaints / limit),
      data: complaints
    });
  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).json({ 
      success: false,
      error: "Server error while fetching complaints" 
    });
  }
};

// @desc    Get single complaint by ID
// @route   GET /api/complaints/:id
// @access  Public
export const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ 
        success: false,
        error: "Complaint not found" 
      });
    }
    
    res.json({
      success: true,
      data: complaint
    });
  } catch (error) {
    console.error("Error fetching complaint:", error);
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        error: "Invalid complaint ID format" 
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: "Server error while fetching complaint" 
    });
  }
};

// @desc    Create new complaint
// @route   POST /api/complaints
// @access  Public
export const createComplaint = async (req, res) => {
  try {
    const { title, description, reporterId, photo, location, priority, category } = req.body;
    
    // Validate input data
    const validation = validateComplaintData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ 
        success: false,
        error: "Validation error",
        details: validation.errors
      });
    }
    if (!location?.lat || !location?.lng) {
      return res.status(400).json({ success: false, error: "Location coordinates required" });
    }
    
    const complaint = new Complaint({
      title: title.trim(),
      description: description.trim(),
      reporterId: reporterId.trim(),
      photo: photo,
      location: {
        lat: location.lat,
        lon: location.lon,
        address: location.address || ""

      },
      priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
      category: category || "Other"
    });
    
    const savedComplaint = await complaint.save();
    
    res.status(201).json({
      success: true,
      message: "Complaint created successfully",
      data: savedComplaint
    });
  } catch (error) {
    console.error("Error creating complaint:", error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false,
        error: "Validation error",
        details: validationErrors
      });
    }
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        error: "Duplicate complaint entry"
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: "Server error while creating complaint" 
    });
  }
};

// @desc    Update complaint
// @route   PUT /api/complaints/:id
// @access  Public (In production, this should be restricted)
export const updateComplaint = async (req, res) => {
  try {
    const { status, priority, assignedTo } = req.body;
    
    const updateFields = {};
    if (status) updateFields.status = status;
    if (priority) updateFields.priority = priority;
    if (assignedTo) updateFields.assignedTo = assignedTo;
    
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );
    
    if (!complaint) {
      return res.status(404).json({ 
        success: false,
        error: "Complaint not found" 
      });
    }
    
    res.json({
      success: true,
      message: "Complaint updated successfully",
      data: complaint
    });
  } catch (error) {
    console.error("Error updating complaint:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        error: "Invalid complaint ID format" 
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: "Server error while updating complaint" 
    });
  }
};

// @desc    Delete complaint
// @route   DELETE /api/complaints/:id
// @access  Public (In production, this should be restricted)
export const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ 
        success: false,
        error: "Complaint not found" 
      });
    }
    
    res.json({
      success: true,
      message: "Complaint deleted successfully",
      data: { id: req.params.id }
    });
  } catch (error) {
    console.error("Error deleting complaint:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        error: "Invalid complaint ID format" 
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: "Server error while deleting complaint" 
    });
  }
};

// @desc    Get complaint statistics
// @route   GET /api/complaints/stats
// @access  Public
export const getComplaintStats = async (req, res) => {
  try {
    const stats = await Complaint.aggregate([
      {
        $group: {
          _id: null,
          totalComplaints: { $sum: 1 },
          pendingComplaints: {
            $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] }
          },
          inProgressComplaints: {
            $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] }
          },
          resolvedComplaints: {
            $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] }
          }
        }
      }
    ]);
    
    const categoryStats = await Complaint.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalComplaints: 0,
          pendingComplaints: 0,
          inProgressComplaints: 0,
          resolvedComplaints: 0
        },
        categoryBreakdown: categoryStats
      }
    });
  } catch (error) {
    console.error("Error fetching complaint stats:", error);
    res.status(500).json({ 
      success: false,
      error: "Server error while fetching statistics" 
    });
  }
};