import express from "express";
import { getProducts,getUserCategories ,getProductById,
  getRelatedProducts } from "../../controllers/user/productController.js";

const router = express.Router();
router.get("/", getProducts);
router.get("/categories", getUserCategories);
router.get("/:id", getProductById);
router.get("/related/items", getRelatedProducts);
export default router;
