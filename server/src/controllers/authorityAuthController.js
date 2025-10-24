import Authority from "../models/Authority.js";
import { generateOTP, sendOTPEmail, sendWelcomeEmail } from "../services/emailService.js";
import jwt from "jsonwebtoken";

// @desc    Send OTP to authority email
// @route   POST /api/auth/authority/login
// @access  Public
export const sendAuthorityOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required"
      });
    }

    // Check if authority exists
    let authority = await Authority.findOne({ email: email.toLowerCase() });

    if (!authority) {
      return res.status(404).json({
        success: false,
        error: "Authority not found. Please contact administrator to register your account."
      });
    }

    if (!authority.isActive) {
      return res.status(403).json({
        success: false,
        error: "Your account has been deactivated. Please contact administrator."
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update authority with OTP
    authority.otp = {
      code: otp,
      expiresAt: otpExpiry
    };
    await authority.save();

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp, authority.name);
    console.log('Email Result:', emailResult);

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        error: "Failed to send OTP email. Please try again."
      });
    }

    console.log(`Authority OTP generated for ${email}: ${otp}`);

    res.json({
      success: true,
      message: "OTP sent successfully to your email",
      data: {
        email: email,
        expiresIn: "10 minutes"
      }
    });

  } catch (error) {
    console.error("Error sending authority OTP:", error);
    res.status(500).json({
      success: false,
      error: "Server error while sending OTP"
    });
  }
};

// @desc    Verify authority OTP
// @route   POST /api/auth/authority/verify-otp
// @access  Public
export const verifyAuthorityOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: "Email and OTP are required"
      });
    }

    // Find authority
    const authority = await Authority.findOne({ email: email.toLowerCase() });

    if (!authority) {
      return res.status(404).json({
        success: false,
        error: "Authority not found"
      });
    }

    if (!authority.isActive) {
      return res.status(403).json({
        success: false,
        error: "Your account has been deactivated"
      });
    }

    // Check if OTP exists and is not expired
    if (!authority.otp || !authority.otp.code || !authority.otp.expiresAt) {
      return res.status(400).json({
        success: false,
        error: "No OTP found. Please request a new OTP"
      });
    }

    if (new Date() > authority.otp.expiresAt) {
      return res.status(400).json({
        success: false,
        error: "OTP has expired. Please request a new OTP"
      });
    }

    // Verify OTP
    if (authority.otp.code !== otp) {
      return res.status(400).json({
        success: false,
        error: "Invalid OTP. Please try again"
      });
    }

    // Clear OTP
    authority.otp = {
      code: null,
      expiresAt: null
    };
    authority.lastLogin = new Date();
    await authority.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        id: authority._id,
        email: authority.email,
        role: 'authority'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`✅ Authority login successful: ${email}`);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        authority: {
          id: authority._id,
          name: authority.name,
          email: authority.email,
          department: authority.department,
          designation: authority.designation,
          phone: authority.phone,
          lastLogin: authority.lastLogin
        }
      }
    });

  } catch (error) {
    console.error("Error verifying authority OTP:", error);
    res.status(500).json({
      success: false,
      error: "Server error while verifying OTP"
    });
  }
};

// @desc    Register new authority (Admin only)
// @route   POST /api/auth/authority/register
// @access  Private (Admin)
export const registerAuthority = async (req, res) => {
  try {
    const { name, email, department, designation, phone } = req.body;

    // Validate required fields
    if (!name || !email || !department || !designation || !phone) {
      return res.status(400).json({
        success: false,
        error: "All fields are required"
      });
    }

    // Check if authority already exists
    const existingAuthority = await Authority.findOne({ email: email.toLowerCase() });

    if (existingAuthority) {
      return res.status(400).json({
        success: false,
        error: "Authority with this email already exists"
      });
    }

    // Create new authority
    const authority = new Authority({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      department: department.trim(),
      designation: designation.trim(),
      phone: phone.trim()
    });

    await authority.save();

    // Send welcome email
    const emailResult = await sendWelcomeEmail(email, name, department);

    console.log(`✅ New authority registered: ${email} - ${name} (${department})`);

    res.status(201).json({
      success: true,
      message: "Authority registered successfully",
      data: {
        authority: {
          id: authority._id,
          name: authority.name,
          email: authority.email,
          department: authority.department,
          designation: authority.designation,
          phone: authority.phone,
          isActive: authority.isActive
        },
        emailSent: emailResult.success
      }
    });

  } catch (error) {
    console.error("Error registering authority:", error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Authority with this email already exists"
      });
    }

    res.status(500).json({
      success: false,
      error: "Server error while registering authority"
    });
  }
};

// @desc    Get authority profile
// @route   GET /api/auth/authority/profile
// @access  Private (Authority)
export const getAuthorityProfile = async (req, res) => {
  try {
    const authority = await Authority.findById(req.user.id).select('-otp');

    if (!authority) {
      return res.status(404).json({
        success: false,
        error: "Authority not found"
      });
    }

    res.json({
      success: true,
      data: {
        id: authority._id,
        name: authority.name,
        email: authority.email,
        department: authority.department,
        designation: authority.designation,
        phone: authority.phone,
        isActive: authority.isActive,
        lastLogin: authority.lastLogin,
        createdAt: authority.createdAt
      }
    });

  } catch (error) {
    console.error("Error fetching authority profile:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching profile"
    });
  }
};

// @desc    Update authority profile
// @route   PUT /api/auth/authority/profile
// @access  Private (Authority)
export const updateAuthorityProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const updates = {};

    if (name) updates.name = name.trim();
    if (phone) updates.phone = phone.trim();

    const authority = await Authority.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('-otp');

    if (!authority) {
      return res.status(404).json({
        success: false,
        error: "Authority not found"
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: authority._id,
        name: authority.name,
        email: authority.email,
        department: authority.department,
        designation: authority.designation,
        phone: authority.phone,
        isActive: authority.isActive,
        lastLogin: authority.lastLogin
      }
    });

  } catch (error) {
    console.error("Error updating authority profile:", error);
    res.status(500).json({
      success: false,
      error: "Server error while updating profile"
    });
  }
};

// @desc    Get all authorities (Super Admin)
// @route   GET /api/auth/authority/all
// @access  Public (Super Admin only - no auth for simplicity)
export const getAllAuthorities = async (req, res) => {
  try {
    const authorities = await Authority.find({})
      .select('-otp')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: authorities.map(authority => ({
        id: authority._id,
        name: authority.name,
        email: authority.email,
        department: authority.department,
        designation: authority.designation,
        phone: authority.phone,
        isActive: authority.isActive,
        lastLogin: authority.lastLogin,
        createdAt: authority.createdAt
      }))
    });

  } catch (error) {
    console.error("Error fetching authorities:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching authorities"
    });
  }
};

// @desc    Update authority (Super Admin)
// @route   PUT /api/auth/authority/:id
// @access  Public (Super Admin only - no auth for simplicity)
export const updateAuthority = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, department, designation, phone, isActive } = req.body;

    const updates = {};
    if (name) updates.name = name.trim();
    if (email) updates.email = email.toLowerCase().trim();
    if (department) updates.department = department.trim();
    if (designation) updates.designation = designation.trim();
    if (phone) updates.phone = phone.trim();
    if (typeof isActive === 'boolean') updates.isActive = isActive;

    const authority = await Authority.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).select('-otp');

    if (!authority) {
      return res.status(404).json({
        success: false,
        error: "Authority not found"
      });
    }

    res.json({
      success: true,
      message: "Authority updated successfully",
      data: {
        id: authority._id,
        name: authority.name,
        email: authority.email,
        department: authority.department,
        designation: authority.designation,
        phone: authority.phone,
        isActive: authority.isActive,
        lastLogin: authority.lastLogin
      }
    });

  } catch (error) {
    console.error("Error updating authority:", error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Authority with this email already exists"
      });
    }

    res.status(500).json({
      success: false,
      error: "Server error while updating authority"
    });
  }
};

// @desc    Delete authority (Super Admin)
// @route   DELETE /api/auth/authority/:id
// @access  Public (Super Admin only - no auth for simplicity)
export const deleteAuthority = async (req, res) => {
  try {
    const { id } = req.params;

    const authority = await Authority.findByIdAndDelete(id);

    if (!authority) {
      return res.status(404).json({
        success: false,
        error: "Authority not found"
      });
    }

    res.json({
      success: true,
      message: "Authority deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting authority:", error);
    res.status(500).json({
      success: false,
      error: "Server error while deleting authority"
    });
  }
};
