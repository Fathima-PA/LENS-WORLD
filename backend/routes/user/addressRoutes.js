import express from "express";
import {
  addAddress,
  getMyAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} from "../../controllers/user/addressController.js";

import { protect } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, addAddress);
router.get("/my", protect, getMyAddress);
router.put("/:id", protect, updateAddress);
router.delete("/:id", protect, deleteAddress);
router.put( "/set-default/:id",protect, setDefaultAddress);


export default router;
