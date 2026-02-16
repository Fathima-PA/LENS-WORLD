import express from "express";
import { toggleWishlist, getWishlist } from "../../controllers/user/wishlistController.js";
import { protect } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/toggle", protect, toggleWishlist);
router.get("/", protect, getWishlist);

export default router;
