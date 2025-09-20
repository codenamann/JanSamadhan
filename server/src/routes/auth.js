import express from "express";
const router = express.Router();
import { citizenSignin, citizenVerify } from "../controllers/authController.js";

// router.post("/register", registerUser);
router.post("/citizen/login", citizenSignin);

router.post('/citizen/verify-otp', citizenVerify)

export default router;