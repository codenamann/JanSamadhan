import express from "express";
import {
  sendAuthorityOTP,
  verifyAuthorityOTP,
  registerAuthority,
  getAuthorityProfile,
  updateAuthorityProfile,
  getAllAuthorities,
  updateAuthority,
  deleteAuthority
} from "../controllers/authorityAuthController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/login", sendAuthorityOTP);
router.post("/verify-otp", verifyAuthorityOTP);

// Admin routes (for registering new authorities)
router.post("/register", registerAuthority);

// Protected routes (require authentication)
router.get("/profile", authMiddleware, getAuthorityProfile);
router.put("/profile", authMiddleware, updateAuthorityProfile);

// Super Admin routes (no authentication for simplicity)
router.get("/all", getAllAuthorities);
router.put("/:id", updateAuthority);
router.delete("/:id", deleteAuthority);

export default router;
