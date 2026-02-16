import express from "express";
import {
  getCart,
  addToCart,
  removeCartItem,
  updateCartQuantity
} from "../../controllers/user/cartController.js";
import { protect } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getCart);
router.post("/add", protect, addToCart);
router.delete("/:itemId", protect, removeCartItem);
router.patch("/quantity", protect, updateCartQuantity);

export default router;
