import express from "express";
const router = express.Router();
import { citizenSignin, citizenSubmitName, citizenVerify } from "../controllers/authController.js";
import authorityAuthRoutes from "./authorityAuth.js";

// Citizen routes
router.post("/citizen/login", citizenSignin);
router.post('/citizen/verify-otp', citizenVerify);
router.patch('/citizen/submit-name', citizenSubmitName);

// Authority routes
router.use("/authority", authorityAuthRoutes);

export default router;