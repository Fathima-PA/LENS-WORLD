import express from "express";
import {
  googleLogin,
  sendOtp,
  verifyOtp,
  resetPassword,
  refreshAccessToken,
  logoutUser,
} from "../../controllers/user/authControler.js";

const router = express.Router();

router.post("/google", googleLogin);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

// ✅ NEW
router.get("/refresh", refreshAccessToken);
router.post("/logout", logoutUser);

export default router;
