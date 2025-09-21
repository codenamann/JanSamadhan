import express from "express";
import {
  getAllComplaints,
  getComplaintById,
  createComplaint,
  updateComplaint,
  deleteComplaint,
  getComplaintStats
} from "../controllers/complaintController.js";

const router = express.Router();

// GET complaint statistics
router.get("/stats", getComplaintStats);

// GET all complaints
router.get("/", getAllComplaints);

// GET single complaint by ID
router.get("/:id", getComplaintById);

// POST new complaint (with strict rate limiting)
router.post("/", createComplaint);

// PUT update complaint
router.put("/:id", updateComplaint);

// DELETE complaint (with strict rate limiting)
router.delete("/:id", deleteComplaint);

export default router;
