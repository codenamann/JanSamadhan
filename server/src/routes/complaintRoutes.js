import express from "express";
import {
  getAllComplaints,
  getComplaintById,
  createComplaint,
  updateComplaint,
  deleteComplaint,
  getComplaintStats
} from "../controllers/complaintController.js";
import { rateLimiter, strictRateLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Apply rate limiting to all routes
router.use(rateLimiter);

// GET complaint statistics
router.get("/stats", getComplaintStats);

// GET all complaints
router.get("/", getAllComplaints);

// GET single complaint by ID
router.get("/:id", getComplaintById);

// POST new complaint (with strict rate limiting)
router.post("/", strictRateLimiter, createComplaint);

// PUT update complaint
router.put("/:id", updateComplaint);

// DELETE complaint (with strict rate limiting)
router.delete("/:id", strictRateLimiter, deleteComplaint);

export default router;
