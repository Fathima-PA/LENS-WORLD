import express from "express";
import {
  adminLogin,
  adminLogout,
  getUsers,
  toggleBlockUser,
} from "../../controllers/admin/adminController.js";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../../controllers/admin/adminCategoryController.js";
import {
  createProductWithVariant,
  getProducts,
toggleProductStatus,
  getProductById,
   updateProductWithVariant
} from "../../controllers/admin/adminProductController.js";
import { addVariantToProduct} from "../../controllers/admin/adminVariantController.js"

import{getAllOrders,updateOrderStatus,getOrderDetailsAdmin,  approveCancel,
  rejectCancel,
  approveReturn,
  rejectReturn} from "../../controllers/admin/adminOrderController.js"
import upload from "../../middlewares/uploadMiddleware.js";

import { protectAdmin } from "../../middlewares/adminMiddleware.js";

const router = express.Router();

/* ================= AUTH ================= */
router.post("/login", adminLogin);
router.post("/logout", adminLogout);

router.get("/me", protectAdmin, (req, res) => {
  res.status(200).json(req.user);
});

/* ================= USERS ================= */
router.get("/users", protectAdmin, getUsers);
router.put("/block/:id", protectAdmin, toggleBlockUser);

/* ================= CATEGORIES ================= */
router.get("/categories", protectAdmin, getCategories);

router.post(
  "/categories",
  protectAdmin,
  upload.single("image"),
  createCategory
);

router.get("/categories/:id", protectAdmin, getCategoryById);

router.put(
  "/categories/:id",
  protectAdmin,
  upload.single("image"),
  updateCategory
);

router.delete(
  "/categories/:id",
  protectAdmin,
  deleteCategory
);

/* ================= PRODUCTS ================= */

router.post(
  "/products",
  protectAdmin,
  upload.array("images", 50),
  createProductWithVariant
);

/* GET PRODUCTS */
router.get(
  "/products",
  protectAdmin,
  getProducts
);
router.get(
  "/products/:id",
  protectAdmin,
  getProductById
);
router.put(
  "/products/:id",
  protectAdmin,
  upload.array("images", 50),
  updateProductWithVariant
);


router.patch("/products/toggle/:id", toggleProductStatus);

router.post(
  "/products/:productId/variants",
  protectAdmin,
  upload.array("images", 3),
  addVariantToProduct
);





router.get("/orders", protectAdmin, getAllOrders);
router.patch("/orders/status/:id",  protectAdmin,updateOrderStatus);
router.get("/orders/:id",protectAdmin, getOrderDetailsAdmin);
router.patch("/orders/approve-cancel/:id", protectAdmin, approveCancel);
router.patch("/orders/reject-cancel/:id", protectAdmin, rejectCancel);

router.patch("/orders/approve-return/:id", protectAdmin, approveReturn);
router.patch("/orders/reject-return/:id", protectAdmin, rejectReturn);

export default router;
