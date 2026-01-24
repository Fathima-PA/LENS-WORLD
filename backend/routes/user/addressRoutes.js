import express from "express";
import {
  addAddress,
  getMyAddress,
  updateAddress,
  deleteAddress,
} from "../../controllers/user/addressController.js";

import { protect } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, addAddress);
router.get("/my", protect, getMyAddress);
router.put("/:id", protect, updateAddress);
router.delete("/:id", protect, deleteAddress);

export default router;
