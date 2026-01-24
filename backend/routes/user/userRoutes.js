import express from "express";
import {
  registerUser,
  loginUser,
  updateProfile,
  confirmEmailChange,
  setPendingEmail,
  changePassword,
  updateProfilePhoto,
  getMe,
} from "../../controllers/user/userController.js";

import { protect } from "../../middlewares/authMiddleware.js";
import upload from "../../middlewares/uploadMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/me", protect, getMe);

router.put("/update-profile", protect, updateProfile);
router.put("/set-pending-email", protect, setPendingEmail);
router.put("/confirm-email-change", protect, confirmEmailChange);
router.put("/change-password", protect, changePassword);

router.put("/update-photo", protect, upload.single("photo"), updateProfilePhoto);

export default router;
