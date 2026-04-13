import { applyCouponService, getAvailableCouponsService  } from "../../services/user/couponService.js";

export const applyCoupon = async (req, res) => {
  try {

    const result = await applyCouponService(req.body);

    res.json(result);

  } catch (error) {

    res.status(error.statusCode || 500).json({
      message: error.message
    });

  }
};



export const getAvailableCoupons = async (req, res) => {
  try {

    const coupons = await getAvailableCouponsService();

    res.json(coupons);

  } catch (err) {

    console.error("Coupon fetch error:", err);

    res.status(500).json({
      message: "Failed to fetch coupons"
    });
  }
};


