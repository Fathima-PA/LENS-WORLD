import express from "express";
import { placeOrderCOD } from "../../controllers/user/orderController.js";

import { protect } from "../../middlewares/authMiddleware.js";

const router=express.Router();

router.post("/place-cod",protect,placeOrderCOD);

export default router;
