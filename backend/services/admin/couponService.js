import Coupon from "../../models/couponModel.js";
export const createCouponService = async (data) => {

  const {
    code,
    discountType,
    discountValue,
    minPurchase,
    maxDiscount,
    expiryDate
  } = data;

  const existingCoupon = await Coupon.findOne({ code });
  if (existingCoupon) {
    return {
      success: false,
      message: "Coupon already exists"
    };
  }

  if (discountType === "percentage" && discountValue > 100) {
    return {
      success: false,
      message: "Percentage cannot exceed 100"
    };
  }

  const coupon = new Coupon({
    code,
    discountType,
    discountValue,
    minPurchase,
    maxDiscount,
    expiryDate
  });

  await coupon.save();

  return {
    success: true,
    message: "Coupon created successfully"
  };
};


export const getCouponsService = async (queryParams) => {

  let { page = 1, limit = 5, search = "" } = queryParams;

  page = parseInt(page);
  limit = parseInt(limit);

  const query = {};

  // Search by coupon code
  if (search) {
    query.code = { $regex: search, $options: "i" };
  }

  const totalCoupons = await Coupon.countDocuments(query);

  const coupons = await Coupon.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    success: true,
    coupons,
    totalPages: Math.ceil(totalCoupons / limit),
    currentPage: page
  };
};



export const toggleCouponStatusService = async (id) => {

  const coupon = await Coupon.findById(id);

  if (!coupon) {
    return { success: false, message: "Coupon not found" };
  }

  coupon.isActive = !coupon.isActive;
  await coupon.save();

  return {
    success: true,
    message: coupon.isActive ? "Coupon Unblocked" : "Coupon Blocked"
  };
};


export const updateCouponService = async (id, data) => {

  const {
    code,
    discountType,
    discountValue,
    minPurchase,
    maxDiscount,
    expiryDate
  } = data;

  const coupon = await Coupon.findById(id);

  if (!coupon) {
    return {
      success: false,
      message: "Coupon not found"
    };
  }

  const existingCoupon = await Coupon.findOne({
    code,
    _id: { $ne: id }
  });

  if (existingCoupon) {
    return {
      success: false,
      message: "Coupon code already exists"
    };
  }

  if (discountType === "percentage" && discountValue > 100) {
    return {
      success: false,
      message: "Percentage cannot exceed 100"
    };
  }

  coupon.code = code;
  coupon.discountType = discountType;
  coupon.discountValue = discountValue;
  coupon.minPurchase = minPurchase;
  coupon.maxDiscount = maxDiscount;
  coupon.expiryDate = expiryDate;

  await coupon.save();

  return {
    success: true,
    message: "Coupon updated successfully",
    coupon
  };
};