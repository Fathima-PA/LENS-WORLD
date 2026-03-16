import express from "express";
import { placeOrderCOD,getMyOrders,  getOrderDetails,
  cancelOrder,
  returnOrder,cancelOrderItem,downloadInvoice,verifyRazorpayPayment,getWallet,retryRazorpayPayment,markPaymentFailed} from "../../controllers/user/orderController.js";
import {applyCoupon,getAvailableCoupons} from "../../controllers/user/couponController.js"
import { protect } from "../../middlewares/authMiddleware.js";

const router=express.Router();
console.log("ORDER ROUTES LOADED");

router.post("/place-cod",protect,placeOrderCOD);
router.get("/my", protect, getMyOrders);
router.post("/verify-payment", verifyRazorpayPayment);
router.post("/retry-payment/:orderId", retryRazorpayPayment);
router.post("/payment-failed", markPaymentFailed);
router.post("/apply-coupon", applyCoupon);
router.get("/available-coupons", getAvailableCoupons);
router.get("/wallet",protect,getWallet);
router.get("/:id", protect, getOrderDetails);
router.patch("/cancel/:id", protect, cancelOrder);
router.patch("/return/:id", protect, returnOrder);
router.patch("/cancel-item/:id", protect, cancelOrderItem);
router.get("/invoice/:id", protect, downloadInvoice);

export default router;
