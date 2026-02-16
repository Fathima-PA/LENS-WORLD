import express from "express";
import { getProducts,getUserCategories ,getProductById,
  getRelatedProducts } from "../../controllers/user/productController.js";

const router = express.Router();
router.get("/", getProducts);
router.get("/categories", getUserCategories);
router.get("/:id", getProductById);
router.get("/related/items", getRelatedProducts);
export default router;




// import express from "express";
// import { addToCart, getCart, updateQuantity, removeFromCart } 
// from "../../controllers/user/cartController.js";
// import { verifyUser } from "../../middlewares/authMiddleware.js";

// const router = express.Router();

// // add product
// router.post("/add", verifyUser, addToCart);

// // list cart
// router.get("/", verifyUser, getCart);

// // increase / decrease qty
// router.patch("/quantity", verifyUser, updateQuantity);

// // remove item
// router.delete("/remove/:itemId", verifyUser, removeFromCart);

// export default router;
