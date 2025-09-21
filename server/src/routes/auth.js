import express from "express";
const router = express.Router();
import { citizenSignin, citizenSubmitName, citizenVerify } from "../controllers/authController.js";

// router.post("/register", registerUser);
router.post("/citizen/login", citizenSignin);

router.post('/citizen/verify-otp', citizenVerify)

router.patch('/citizen/submit-name', citizenSubmitName);

export default router;