import Coupon from "../../models/couponModel.js";

export const applyCouponService = async (data) => {

  const { code, subtotal } = data;

  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true
  });

  if (!coupon) {
    const error = new Error("Invalid coupon");
    error.statusCode = 400;
    throw error;
  }

  if (coupon.expiryDate < new Date()) {
    const error = new Error("Coupon expired");
    error.statusCode = 400;
    throw error;
  }

  if (subtotal < coupon.minPurchase) {
    const error = new Error("Minimum purchase not reached");
    error.statusCode = 400;
    throw error;
  }

  let discount = 0;

  if (coupon.discountType === "percentage") {
    discount = (subtotal * coupon.discountValue) / 100;

    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  } else {
    discount = coupon.discountValue;
  }

  return {
    success: true,
    discount,
    couponCode: coupon.code
  };
};



export const getAvailableCouponsService = async () => {

  const coupons = await Coupon.find({
    isActive: true,
    $or: [
      { expiryDate: { $gte: new Date() } },
      { expiryDate: { $exists: false } }
    ]
  }).select("code discountType discountValue minPurchase maxDiscount expiryDate");

  return coupons;
};