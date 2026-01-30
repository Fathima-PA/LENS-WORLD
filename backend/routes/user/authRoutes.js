import express from "express";
import {
  googleLogin,
  sendOtp,
  verifyOtp,
  resetPassword,
  refreshAccessToken,
  logoutUser,
} from "../../controllers/user/authControler.js";
import { protect } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/google", googleLogin);
router.post(
  "/send-otp",
  (req, res, next) => {
    if (req.body.purpose === "VERIFY_NEW_EMAIL") {
      return protect(req, res, next);
    }
    next();
  },
  sendOtp
);

router.post(
  "/verify-otp",
  (req, res, next) => {
    if (req.body.purpose === "VERIFY_NEW_EMAIL") {
      return protect(req, res, next);
    }
    next();
  },
  verifyOtp
);

router.post(
  "/reset-password",
  (req, res, next) => {
    if (req.body.purpose === "VERIFY_NEW_EMAIL") {
      return protect(req, res, next);
    }
    next();
  },
  resetPassword
);
router.get("/refresh", refreshAccessToken);
router.post("/logout", logoutUser);

export default router;
